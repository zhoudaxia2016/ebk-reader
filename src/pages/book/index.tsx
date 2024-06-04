import './index.less'
import React from 'react'
import Reader, {handleLaunchWithFile} from '~/utils/reader'
import {LeftOutlined, RightOutlined, HomeOutlined, EllipsisOutlined, SearchOutlined, BackwardOutlined, ForwardOutlined} from '@ant-design/icons'
import {Button, Dropdown, Progress} from 'antd'
import {EPUB} from '~/foliate-js/epub'
import Dir from './Dir'
import Hammer from 'hammerjs'
import color from '~/config/color'
import Search from './Search'
import iddb from '~/storage/iddb'

interface IProps {
  searchParams: any,
  navigate: any,
}

interface IState {
  sections: EPUB['sections'],
  sectionIndex: number,
  toc: any[],
  fullReader: boolean,
  fraction: number,
  showSearch: boolean,
  pages?: number,
  page?: number,
  selection?: {cfi: string, x: number, y: number, text: string},
}

interface INote {
  id: number,
  bookId: number,
  sectionIndex: number,
  cfi: string,
  date: {year: number, month: number, day: number},
  text: string,
  view?: string,
  color?: string,
}

export default class Book extends React.Component<IProps, IState> {
  private refReaderContainer = React.createRef<HTMLDivElement>()
  private book
  private id: number
  private hammer: Hammer
  private startTouch: any
  private touchStartTime: number
  private reader: Reader
  private notes: INote[] = []
  public state: IState = {
    sections: [],
    sectionIndex: 0,
    toc: [],
    fullReader: true,
    fraction: 0,
    showSearch: false,
  }

  async componentDidMount() {
    if (!this.refReaderContainer.current) {
      return
    }
    const {searchParams} = this.props
    let id: number | void = Number(searchParams.get('id'))
    if (!id) {
      id = await handleLaunchWithFile()
      this.props.navigate('/book?id=' + id)
    }
    if (!id) {
      alert('id 不存在')
      return
    }
    this.id = id
    const reader = new Reader(id, this.handleRelocate, this.handleLoad, this.handleContextMenu)
    await reader.init(this.refReaderContainer.current)
    this.reader = reader
    const fraction = reader.bookUserInfo.get('fraction')
    reader.view.addEventListener('touchstart', this.handleTouchStart)
    reader.view.addEventListener('touchend', this.handleTouchEnd)
    this.setState({
      sections: reader.book.sections,
      toc: reader.book.toc,
      fraction,
    })
    this.loadNotes()
  }

  componentWillUnmount() {
    this.reader?.view.removeEventListener('touchstart', this.handleTouchStart)
    this.reader?.view.removeEventListener('touchend', this.handleTouchEnd)
    this.reader?.destroy()
    this.reader = null
  }

  private async loadNotes() {
    const notes = await iddb.getNotes() || []
    this.notes = notes.map(([_, n]) => n).filter(_ => _.bookId === this.id)
  }

  private drawNotes(sectionIndex) {
    const notes = this.notes.filter(_ => _.sectionIndex === sectionIndex)
    notes.forEach(_ => {
      this.reader.addAnnotation(_)
    })
  }

  private handleContextMenu = (selection) => {
    this.setState({selection})
  }

  private handleRelocate = ({fraction}) => {
    const {pages, page} = this.reader.view.renderer || {}
    this.setState({fraction, pages, page: page + 1})
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
    if (Math.abs(hr) > Math.abs(vr) && Math.abs(hr) > 55) {
      if (hr < 0 && !this.isNextDisabled()) {
        this.next()
      }
      if (hr > 0 && !this.isPrevDisabled()) {
        this.prev()
      }
    }
  }

  private handleLoad = ({doc, index}) => {
    this.hammer?.off('tap', this.handleTap)
    this.hammer?.off('doubletap', this.handleDoubleTap)
    this.hammer = new Hammer(doc)
    this.hammer.on('tap', this.handleTap)
    this.hammer.on('doubletap', this.handleDoubleTap)
    this.setState({sectionIndex: index})
    doc.addEventListener('touchstart', this.handleTouchStart)
    doc.addEventListener('touchend', this.handleTouchEnd)
    setTimeout(() => {
      this.drawNotes(index)
    })
  }

  private prev = () => {
    this.reader?.prev()
  }

  private next = () => {
    this.reader?.next()
  }

  private backward = () => {
    this.reader?.backward()
  }

  private forward = () => {
    this.reader?.forward()
  }

  private goto = (href) => {
    this.reader?.goto(href)
  }

  private handleBackHome = () => {
    const {navigate} = this.props
    navigate('/')
  }

  private toggleSearch = () => {
    this.setState({showSearch: !this.state.showSearch})
  }

  private handleNote = () => {
    const {cfi, text} = this.state.selection
    const date = new Date()
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const note = {
      id: Date.now(), bookId: this.id,
      sectionIndex: this.state.sectionIndex,
      cfi: cfi,
      date: {year, month, day},
      text,
    }
    iddb.addNote(note)
    this.reader.addAnnotation(note)
  }

  private closeContextMenu = () => {
    this.reader.closeContextMenu()
  }

  render() {
    const {fullReader, toc, fraction, showSearch, pages, page, selection} = this.state
    const title = this.book?.metadata.title
    const reader = this.reader

    const menus = [
      {
        label: (
          <Button type="text" disabled={!reader?.view?.history.canGoBack}>
            <BackwardOutlined onClick={this.backward}/>
          </Button>
        ),
        key: 0
      },
      {
        label: (
          <Button type="text" disabled={!reader?.view?.history.canGoForward}>
            <ForwardOutlined onClick={this.forward}/>
          </Button>
        ),
        key: 1
      },
    ]

    return (
      <div className="reader-wrapper">
        <div className="reader" ref={this.refReaderContainer}></div>
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
              {showSearch && <Search view={reader?.view}/>}
            </div>
            <div className="footer-btns">
              <Dir toc={toc} goto={this.goto} title={title}/>
              <Button className="search" type="text" size="large" icon={<SearchOutlined/>} onClick={this.toggleSearch}></Button>
              <Progress className="reader-progress" type="circle" size="small" percent={Math.round(fraction * 100)}
                  strokeColor={color.pr2} format={() => page && `${page}/${pages}`}/>
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
        {
          selection &&
          <div className="context-menu" style={{left: selection.x, top: selection.y}} onClick={this.closeContextMenu}>
            <div className="context-menu-item" onClick={this.handleNote}>标记</div>
          </div>
        }
      </div>
    )
  }
}
