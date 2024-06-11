import {Overlayer} from '~/foliate-js/overlayer'
import iddb from '~/storage/iddb'
import {ObjectStorage} from '~/storage/localStorage'
import {toArrayBuffer} from '../fileReader'
import {getMd5, saveBooks} from '../utils'
import {mountBook, getBook, IView} from './reader'
import highlight from './highlight'

export default class Reader {
  public bookUserInfo: ObjectStorage
  public id: number
  public view: IView
  public book: any

  private sectionIndex: number
  private isLoad = false
  private isSectionChanged = false
  private doc: Document
  private onRelocate: (params: {fraction: number}) => void
  private onSectionLoad: (params: {index: number, doc: HTMLDocument}) => void
  private onSelectionChange: (selection: {x: number, y: number, cfi: string}) => void
  private observer: IntersectionObserver

  constructor(id, onRelocate, onSectionLoad, onSelectionChange) {
    this.id = id
    this.onRelocate = onRelocate
    this.onSectionLoad = onSectionLoad
    this.onSelectionChange = onSelectionChange
  }

  async getBook(id) {
    const data = await iddb.getBookData(id)
    const info = await iddb.getBookInfo(id)
    const blob = new File([data], info.name, {type: info.type})
    return getBook(blob)
  }

  public async init(dom) {
    this.bookUserInfo = new ObjectStorage({name: 'book-userinfo', id: this.id})
    const book: any = await this.getBook(this.id)
    dom.innerText = ''
    const view: IView = await mountBook(book, dom)
    this.view = view
    this.book = book
    this.bindEvents()
  }

  private bindEvents() {
    const view = this.view
    const fraction = this.bookUserInfo.get('fraction') || 0
    view.goToFraction(fraction).then(() => this.isLoad = true)
    view.addEventListener('relocate', this.handleRelocate)
    view.addEventListener('load', this.handleLoad)
    view.addEventListener('draw-annotation', this.drawAnnotation)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.observer = new IntersectionObserver(this.handleCodeBlock)
  }

  public destroy() {
    const view = this.view
    view?.removeEventListener('relocate', this.handleRelocate)
    view?.removeEventListener('load', this.handleLoad)
    view?.removeEventListener('draw-annotation', this.drawAnnotation)
    view?.renderer.destroy()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.setAccessTime()
    this.observer.disconnect()
  }

  private drawAnnotation = (e) => {
    const { draw, annotation } = e.detail
    const { type = Overlayer.highlight } = annotation
    draw(type, annotation)
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.setAccessTime()
    }
  }

  private setAccessTime() {
    this.bookUserInfo?.set('accessTime', Date.now())
  }

  private handleRelocate = (e) => {
    const {fraction} = e.detail
    this.bookUserInfo.set('fraction', fraction)
    this.onRelocate({fraction})
    if (!this.isLoad) {
      return
    }
    setTimeout(() => {
      const view = this.view
      if (this.isSectionChanged) {
        view.history.pushState({fraction})
      } else {
        view.history.replaceState({fraction})
      }
      this.isSectionChanged = false
    })
  }

  private async initHl(dom) {
    const codeBlockLang = this.bookUserInfo.get('codeBlockLang')
    const [lang, adjusted] = await highlight(dom.innerText, codeBlockLang)
    try {
      dom.innerHTML = adjusted
      dom.classList.add('lang-' + lang)
    } catch (err) {
      console.error('[initHl] failed:', err)
      console.error('[initHl] adjusted', adjusted)
      console.error('[initHl] lang', lang)
    }
  }

  private observeCodeBlock(doc) {
    const codeDoms = doc.querySelectorAll('pre code')
    Array.from(codeDoms).forEach((dom: HTMLElement) => {
      this.observer.observe(dom)
    })
  }

  private handleLoad = (e) => {
    const view = this.view
    const doc = e.detail.doc
    if (/^\s+$/.test(doc.body.innerText)) {
      view.renderer.setAttribute('gap', '0')
    } else {
      view.renderer.setAttribute('gap', '6')
    }
    this.onSectionLoad(e.detail)
    this.sectionIndex = e.detail.index
    this.doc = doc
    doc.addEventListener('selectionchange', this.handleSelectionChange)
    doc.addEventListener('contextmenu', this.handleContextMenu)
    doc.addEventListener('touchstart', this.handleTouchStart, true)
    this.observeCodeBlock(doc)
  }

  private handleCodeBlock: IntersectionObserverCallback = (entries) => {
    for (const item of entries) {
      if (item.isIntersecting) {
        this.initHl(item.target)
        this.observer.unobserve(item.target)
      }
    }
  }

  private handleContextMenu = (e) => {
    e.preventDefault()
  }

  public clearSelection() {
    this.doc.getSelection().empty()
  }

  private handleTouchStart = () => {
    this.clearSelection()
  }

  private handleSelectionChange = (e) => {
    const s = e.currentTarget.getSelection()
    const closeContextMenu = () => {
      this.onSelectionChange(null)
      this.clearSelection()
    }
    if (s.rangeCount === 0) {
      closeContextMenu()
      return
    }
    const range = s.getRangeAt(0)
    let {x, y, width, bottom} = range.getBoundingClientRect()
    if (width < 1) {
      closeContextMenu()
      return
    }
    const cfi = this.view.getCFI(this.sectionIndex, range)
    const contextMenuHeight = 50
    y = y - this.view.renderer.start
    if (y < window.innerHeight / 2) {
      y = bottom - this.view.renderer.start + contextMenuHeight + 10
    } else {
      y = y - 10
    }
    const selection = {x, y, cfi, text: s.toString()}
    this.onSelectionChange(selection)
  }

  public prev = () => {
    this.isSectionChanged = true
    this.view?.renderer.prevSection()
  }

  public next = () => {
    this.isSectionChanged = true
    this.view?.renderer.nextSection()
  }

  public backward = () => {
    this.view?.history.back()
  }

  public forward = () => {
    this.view?.history.forward()
  }

  public goto = (href) => {
    this.view?.goTo(href)
  }

  public addAnnotation(val, remove?) {
    this.view.addAnnotation({...val, value: val.cfi}, remove)
  }

  private getOverlayer() {
    return this.view.renderer.getContents()
      .find(x => x.index === this.sectionIndex && x.overlayer)
  }

  public hitTest(e) {
    const {overlayer} = this.getOverlayer()
    return overlayer.hitTest(e)
  }
}

export {mountBook, getBook}

export function handleLaunchWithFile(): Promise<number | void> {
  return new Promise((res) => {
    if ("launchQueue" in window) {
      // @ts-ignore
      window.launchQueue.setConsumer(async (launchParams) => {
        const file = await launchParams.files[0]?.getFile()
        if (!file) {
          return res()
        }
        const data = await toArrayBuffer(file)
        const md5 = getMd5(data)
        const booksInfo = await iddb.getAllBookInfo()
        const result = booksInfo.find(_ => _[1].md5 === md5)
        let id
        if (result) {
          id = result[0]
        } else {
          const {successFiles} = await saveBooks({files: [file], md5Set: new Set()})
          id = successFiles[0].id
        }
        res(id)
      })
    } else {
      res()
    }
  })
}
