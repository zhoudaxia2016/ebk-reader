import {Overlayer} from '~/foliate-js/overlayer'
import iddb from '~/storage/iddb'
import {ObjectStorage} from '~/storage/localStorage'
import {toArrayBuffer} from '../fileReader'
import {isMobile} from '~/utils/userAgent'
import {getMd5, saveBooks} from '../utils'
import {mountBook, getBook, IView} from './reader'

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
  private onContextMenu: (params: {x: number, y: number, cfi: string, text: string}) => void

  constructor(id, onRelocate, onSectionLoad, onContextMenu) {
    this.id = id
    this.onRelocate = onRelocate
    this.onSectionLoad = onSectionLoad
    this.onContextMenu = onContextMenu
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
    view.addEventListener('show-annotation', this.handleShowAnnotation)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  public destroy() {
    const view = this.view
    view?.removeEventListener('relocate', this.handleRelocate)
    view?.removeEventListener('load', this.handleLoad)
    view?.removeEventListener('draw-annotation', this.drawAnnotation)
    view?.addEventListener('show-annotation', this.handleShowAnnotation)
    view?.renderer.destroy()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.setAccessTime()
  }

  private handleShowAnnotation = (e) => {
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
    doc.addEventListener('touchstart', this.closeContextMenu, true)
  }

  private handleContextMenu = (e) => {
    e.preventDefault()
  }

  public closeContextMenu = () => {
    this.onContextMenu(null)
    this.doc.getSelection().empty()
  }

  private handleSelectionChange = (e) => {
    const s = e.currentTarget.getSelection()
    if (s.rangeCount === 0) {
      this.closeContextMenu()
      return
    }
    const range = s.getRangeAt(0)
    const {x, y, width} = range.getBoundingClientRect()
    if (width < 1) {
      this.closeContextMenu()
      return
    }
    const cfi = this.view.getCFI(this.sectionIndex, range)
    const selection = {x, y: y - this.view.renderer.start - 10, cfi, text: s.toString()}
    this.onContextMenu(selection)
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

  public addAnnotation(val) {
    this.view.addAnnotation({...val, value: val.cfi})
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
