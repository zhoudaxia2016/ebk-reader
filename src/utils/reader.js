import 'foliate/view.js'

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
  const reader = new ZipReader(new BlobReader(file))
  const entries = await reader.getEntries()
  const map = new Map(entries.map(entry => [entry.filename, entry]))
  const load = f => (name, ...args) =>
    map.has(name) ? f(map.get(name), ...args) : null
  const loadText = load(entry => entry.getData(new TextWriter()))
  const loadBlob = load((entry, type) => entry.getData(new BlobWriter(type)))
  const getSize = name => map.get(name)?.uncompressedSize ?? 0
  return { entries, loadText, loadBlob, getSize }
}

const getFileEntries = async entry => entry.isFile ? entry
  : (await Promise.all(Array.from(
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

const getCSS = ({ justify, hyphenate }) => `
@namespace epub "http://www.idpf.org/2007/ops";
html {
color-scheme: light dark;
}
/* https://github.com/whatwg/html/issues/5426 */
@media (prefers-color-scheme: dark) {
a:link {
color: lightblue;
}
}
a, p, li, blockquote, dd {
text-align: ${justify ? 'justify' : 'start'};
-webkit-hyphens: ${hyphenate ? 'auto' : 'manual'};
hyphens: ${hyphenate ? 'auto' : 'manual'};
-webkit-hyphenate-limit-before: 3;
-webkit-hyphenate-limit-after: 2;
-webkit-hyphenate-limit-lines: 2;
hanging-punctuation: allow-end last;
widows: 2;
font-size: 19px !important;
line-height: 1.8 !important;
margin-top: 0 !important;
margin-bottom: 10px !important;
color: #212832 !important;
}
/* prevent the above from overriding the align attribute */
[align="left"] { text-align: left; }
[align="right"] { text-align: right; }
[align="center"] { text-align: center; }
[align="justify"] { text-align: justify; }

pre {
white-space: pre-wrap !important;
}
aside[epub|type~="endnote"],
aside[epub|type~="footnote"],
aside[epub|type~="note"],
aside[epub|type~="rearnote"] {
display: none;
}
`

const style = {
  justify: true,
  hyphenate: true,
}

export const getBook = async file => {
  let book
  if (file.isDirectory) {
    const loader = await makeDirectoryLoader(file)
    const { EPUB } = await import('foliate/epub.js')
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
      book = await new EPUB(loader).init()
      console.log('zz_debug', book)
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

export const mountBook = async (book, container) => {
  const view = document.createElement('foliate-view')
  container.append(view)
  await view.open(book)
  view.renderer.setAttribute('flow', 'scrolled')
  view.renderer.setStyles?.(getCSS(style))
  view.renderer.next()
  const title = book.metadata?.title ?? 'Untitled Book'
  document.title = title
  return view
}
