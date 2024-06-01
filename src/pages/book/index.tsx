import './index.less'
import React from 'react'
import iddb from '~/storage/iddb'
import {getBook, mountBook} from '~/utils/reader'
import {LeftOutlined, RightOutlined, HomeOutlined, EllipsisOutlined, SearchOutlined, BackwardOutlined, ForwardOutlined} from '@ant-design/icons'
import {Button, Dropdown, Progress} from 'antd'
import {EPUB} from '~/foliate-js/epub'
import Dir from './Dir'
import Hammer from 'hammerjs'
import {ObjectStorage} from '~/storage/localStorage'
import color from '~/config/color'
import {toArrayBuffer} from '~/utils/fileReader'
import {getMd5, saveBooks} from '../manager/utils'
import Search from './Search'

interface IProps {
  searchParams: any,
  navigate: any,
}

interface IState {
  sections: EPUB['sections'],
  sectionIndex: number,
  view?: any,
  toc: any[],
  fullReader: boolean,
  fraction: number,
  showSearch: boolean,
}

export default class Book extends React.Component<IProps, IState> {
  private refReader = React.createRef<HTMLDivElement>()
  private book
  private id: number
  private hammer: Hammer
  private bookUserInfo: ObjectStorage
  private startTouch: any
  private touchStartTime: number
  private isSectionChanged = false
  private isLoad = false
  public state: IState = {
    sections: [],
    sectionIndex: 0,
    toc: [],
    fullReader: false,
    fraction: 0,
    showSearch: false,
  }

  private handleLaunchWithFile(): Promise<number | void> {
    const {navigate} = this.props
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
          navigate('/book?id=' + id)
          res(id)
        })
      } else {
        res()
      }
    })
  }

  async componentDidMount() {
    if (!this.refReader.current) {
      return
    }
    const {searchParams} = this.props
    let id: number | void = Number(searchParams.get('id'))
    if (!id) {
      id = await this.handleLaunchWithFile()
    }
    if (!id) {
      alert('id 不存在')
      return
    }
    this.bookUserInfo = new ObjectStorage({name: 'book-userinfo', id})
    this.id = id
    const fraction = this.bookUserInfo.get('fraction') || 0
    const data = await iddb.getBookData(id)
    const info = await iddb.getBookInfo(id)
    const blob = new File([data], info.name, {type: info.type})
    const book: any = await getBook(blob)
    this.refReader.current.innerText = ''
    this.book = book
    const view: any = await mountBook(book, this.refReader.current)
    this.setState({
      sections: book.sections,
      toc: book.toc,
      view,
      fraction,
    })
    view.goToFraction(fraction).then(() => this.isLoad = true)
    view.addEventListener('relocate', this.handleRelocate)
    view.addEventListener('load', this.handleLoad)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  componentWillUnmount() {
    this.state.view?.removeEventListener('relocate', this.handleRelocate)
    this.state.view?.removeEventListener('load', this.handleLoad)
    this.state.view?.renderer.destroy()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.setAccessTime()
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
    this.setState({fraction})
    if (!this.isLoad) {
      return
    }
    setTimeout(() => {
      const {view} = this.state
      if (this.isSectionChanged) {
        view.history.pushState({fraction})
      } else {
        view.history.replaceState({fraction})
      }
      this.isSectionChanged = false
    })
  }

  private handleTap = () => {
    const {fullReader, showSearch} = this.state
    this.setState({fullReader: !fullReader, showSearch: showSearch && !fullReader})
  }

  private handleDoubleTap = () => {
    if (document.fullscreen) {
      document.exitFullscreen()
    } else {
      document.body.requestFullscreen()
    }
  }

  private isPrevDisabled() {
    const {sectionIndex} = this.state
    return sectionIndex === 0
  }

  private isNextDisabled() {
    const {sectionIndex, sections} = this.state
    return sectionIndex === sections.length - 1
  }

  private handleTouchStart = (e) => {
    this.startTouch = e.changedTouches[0]
    this.touchStartTime = e.timeStamp
  }
  private handleTouchEnd = (e) => {
    if (e.timeStamp - this.touchStartTime > 200) {
      return
    }
    const start = this.startTouch
    const end = e.changedTouches[0]
    const hr = end.screenX - start.screenX
    const vr = end.screenY - start.screenY
    if (Math.abs(hr) > Math.abs(vr) && Math.abs(hr) > 90) {
      if (hr < 0 && !this.isNextDisabled()) {
        this.next()
      }
      if (hr > 0 && !this.isPrevDisabled()) {
        this.prev()
      }
    }
  }

  private handleLoad = (e) => {
    const {view} = this.state
    const doc = e.detail.doc
    if (/^\s+$/.test(doc.body.innerText)) {
      view.renderer.setAttribute('gap', 0)
    } else {
      view.renderer.setAttribute('gap', 6)
    }
    this.hammer?.off('tap', this.handleTap)
    this.hammer?.off('doubletap', this.handleDoubleTap)
    this.hammer = new Hammer(doc)
    this.hammer.on('tap', this.handleTap)
    this.hammer.on('doubletap', this.handleDoubleTap)
    this.setState({sectionIndex: e.detail.index})
    doc.addEventListener('touchstart', this.handleTouchStart)
    doc.addEventListener('touchend', this.handleTouchEnd)
  }

  private prev = () => {
    this.isSectionChanged = true
    this.state.view?.renderer.prevSection()
  }

  private next = () => {
    this.isSectionChanged = true
    this.state.view?.renderer.nextSection()
  }

  private backward = () => {
    this.state.view?.history.back()
  }

  private forward = () => {
    this.state.view?.history.forward()
  }

  private goto = (href) => {
    this.state.view?.goTo(href)
  }

  private handleBackHome = () => {
    const {navigate} = this.props
    navigate('/')
  }

  private toggleSearch = () => {
    this.setState({showSearch: !this.state.showSearch})
  }

  render() {
    const {fullReader, toc, fraction, showSearch, view} = this.state
    const title = this.book?.metadata.title

    const menus = [
      {
        label: (
          <Button type="text" disabled={!view?.history.canGoBack}>
            <BackwardOutlined onClick={this.backward}/>
          </Button>
        ),
        key: 0
      },
      {
        label: (
          <Button type="text" disabled={!view?.history.canGoForward}>
            <ForwardOutlined onClick={this.forward}/>
          </Button>
        ),
        key: 1
      },
    ]

    return (
      <div className="reader-wrapper">
        <div className="reader" ref={this.refReader}></div>
        {
          !fullReader &&
          <div className="header">
            <Button className="back-home-btn" type="text" icon={<HomeOutlined/>} onClick={this.handleBackHome}></Button>
            <div className="book-title">{title}</div>
          </div>
        }
        {
          !fullReader &&
          <div className="footer">
            <div className="footer-content">
              {showSearch && <Search view={view}/>}
            </div>
            <div className="footer-btns">
              <Dir toc={toc} goto={this.goto} title={title}/>
              <Button className="search" type="text" size="large" icon={<SearchOutlined/>} onClick={this.toggleSearch}></Button>
              <Progress className="reader-progress" type="circle" size="small" percent={Math.round(fraction * 100)} strokeColor={color.pr2} />
              <Button className="prev" type="text" size="large" icon={<LeftOutlined/>} disabled={this.isPrevDisabled()} onClick={this.prev}></Button>
              <Button className="next" type="text" size="large" icon={<RightOutlined/>} disabled={this.isNextDisabled()} onClick={this.next}></Button>
            </div>
          </div>
        }
        {
          !fullReader &&
          <Dropdown className="book-more-dropdown" menu={{items: menus}} trigger={['click']}>
            <Button className="book-more-btn"><EllipsisOutlined/></Button>
          </Dropdown>
        }
      </div>
    )
  }
}
