import 'foliate/view'
import {Paginator} from 'foliate/paginator'
import type {View} from 'foliate/view'

export interface IView extends View {
  renderer: Paginator,
}

const isZip = async file => {
  const arr = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  return arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04
}

const isPDF = async file => {
  const arr = new Uint8Array(await file.slice(0, 5).arrayBuffer())
  return arr[0] === 0x25
    && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46
    && arr[4] === 0x2d
}

const makeZipLoader = async file => {
  const { configure, ZipReader, BlobReader, TextWriter, BlobWriter } =
    await import('foliate/vendor/zip.js')
  configure({ useWebWorkers: false })
  const reader: any = new ZipReader(new BlobReader(file))
  const entries = await reader.getEntries()
  const map = new Map<string, any>(entries.map(entry => [entry.filename, entry]))
  const load = f => (name, ...args) =>
    map.has(name) ? f(map.get(name), ...args) : null
  const loadText = load(entry => entry.getData(new TextWriter()))
  const loadBlob = load((entry, type) => entry.getData(new BlobWriter(type)))
  const getSize = name => map.get(name)?.uncompressedSize ?? 0
  return { entries, loadText, loadBlob, getSize }
}

const getFileEntries = async entry => entry.isFile ? entry
  : (await Promise.all(Array.from(
    // @ts-ignore
    await new Promise((resolve, reject) => entry.createReader()
      .readEntries(entries => resolve(entries), error => reject(error))),
    getFileEntries))).flat()

const makeDirectoryLoader = async entry => {
  const entries = await getFileEntries(entry)
  const files = await Promise.all(
    entries.map(entry => new Promise((resolve, reject) =>
      entry.file(file => resolve([file, entry.fullPath]),
        error => reject(error)))))
  const map = new Map(files.map(([file, path]) =>
    [path.replace(entry.fullPath + '/', ''), file]))
  const decoder = new TextDecoder()
  const decode = x => x ? decoder.decode(x) : null
  const getBuffer = name => map.get(name)?.arrayBuffer() ?? null
  const loadText = async name => decode(await getBuffer(name))
  const loadBlob = name => map.get(name)
  const getSize = name => map.get(name)?.size ?? 0
  return { loadText, loadBlob, getSize }
}

const isCBZ = ({ name, type }) =>
  type === 'application/vnd.comicbook+zip' || name.endsWith('.cbz')

const isFB2 = ({ name, type }) =>
  type === 'application/x-fictionbook+xml' || name.endsWith('.fb2')

const isFBZ = ({ name, type }) =>
  type === 'application/x-zip-compressed-fb2'
    || name.endsWith('.fb2.zip') || name.endsWith('.fbz')

const styleFiles = ['default', 'highlight']
const styleCache = {}
const getCSS = async () => {
  const styles = await Promise.all(styleFiles.map(async f => {
    if (styleCache[f]) {
      return styleCache[f]
    }
    const style = (await import(`./styles/${f}.css?raw`)).default
    styleCache[f] = style
    return style
  }))
  return styles.join('\n')
}

export const getBook = async file => {
  let book
  if (file.isDirectory) {
    const loader = await makeDirectoryLoader(file)
    const { EPUB } = await import('foliate/epub.js')
    // @ts-ignore
    book = await new EPUB(loader).init()
  }
  else if (!file.size) throw new Error('File not found')
  else if (await isZip(file)) {
    const loader = await makeZipLoader(file)
    if (isCBZ(file)) {
      const { makeComicBook } = await import('foliate/comic-book.js')
      book = makeComicBook(loader, file)
    } else if (isFBZ(file)) {
      const { makeFB2 } = await import('foliate/fb2.js')
      const { entries } = loader
      const entry = entries.find(entry => entry.filename.endsWith('.fb2'))
      const blob = await loader.loadBlob((entry ?? entries[0]).filename)
      book = await makeFB2(blob)
    } else {
      const { EPUB } = await import('foliate/epub.js')
      // @ts-ignore
      book = await new EPUB(loader).init()
    }
  }
  else if (await isPDF(file)) {
    const { makePDF } = await import('foliate/pdf.js')
    book = await makePDF(file)
  }
  else {
    const { isMOBI, MOBI } = await import('foliate/mobi.js')
    if (await isMOBI(file)) {
      const fflate = await import('foliate/vendor/fflate.js')
      book = await new MOBI({ unzlib: fflate.unzlibSync }).open(file)
    } else if (isFB2(file)) {
      const { makeFB2 } = await import('foliate/fb2.js')
      book = await makeFB2(file)
    }
  }
  if (!book) throw new Error('File type not supported')
  return book
}

const horizontalModeStyle = `
body {
  writing-mode: horizontal-tb;
  direction: ltr;
}
`

export const mountBook = async (book, container, {horizontal}) => {
  const view = document.createElement('foliate-view') as IView
  container.append(view)
  // 强制滚动视图，#24
  if (book.rendition.layout) {
    book.rendition.layout = ''
  }
  await view.open(book)
  view.renderer.setAttribute('flow', 'scrolled')
  let defaultCSS = await getCSS()
  if (horizontal) {
    defaultCSS += horizontalModeStyle
  }
  view.renderer.setStyles?.(defaultCSS)
  const title = book.metadata?.title ?? 'Untitled Book'
  document.title = title
  return view
}
