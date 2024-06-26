import './index.less'
import React from 'react'
import Reader, {handleLaunchWithFile} from '~/utils/reader'
import {LeftOutlined, RightOutlined, HomeOutlined, EllipsisOutlined, SearchOutlined, BackwardOutlined, ForwardOutlined, EditOutlined} from '@ant-design/icons'
import {Button, Dropdown, Progress} from 'antd'
import {EPUB} from '~/foliate-js/epub'
import Dir from './Dir'
import Hammer from 'hammerjs'
import color from '~/config/color'
import Search from './Search'
import iddb from '~/storage/iddb'
import Notes from './Notes'
import {noteColors} from './config'
import ContextMenu from './ContextMenu'
import {INote, ISelection} from './ContextMenu/types'
import Setting from './Setting'
import ImgViewer from './ImgViewer'

interface IProps {
  searchParams: any,
  navigate: any,
}

enum BT_MODAL {
  note,
  search,
}

interface IState {
  sections: EPUB['sections'],
  sectionIndex: number,
  toc: any[],
  fullReader: boolean,
  fraction: number,
  pages?: number,
  page?: number,
  selection?: ISelection,
  selectNote?: INote,
  btModal?: BT_MODAL | -1,
}

export default class Book extends React.Component<IProps, IState> {
  private refReaderContainer = React.createRef<HTMLDivElement>()
  private id: number
  private hammer: Hammer
  private startTouch: any
  private touchStartTime: number
  private reader: Reader
  private notes: INote[] = []
  private refContextMenu = React.createRef<ContextMenu>()
  private refSearch = React.createRef<Search>()
  public state: IState = {
    sections: [],
    sectionIndex: 0,
    toc: [],
    fullReader: true,
    fraction: 0,
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
    const reader = new Reader(id, this.handleRelocate, this.handleLoad, this.handleSelectionChange)
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

  private handleSelectionChange = (selection) => {
    this.setState({selection})
  }

  private handleRelocate = ({fraction}) => {
    const {pages, page} = this.reader.view.renderer || {}
    this.setState({fraction, pages: pages === 0 ? 1 : pages, page: page + 1})
    this.refContextMenu.current.hideTranslateResult()
  }

  private handleTap = (e) => {
    const [value] = this.reader.hitTest(e.srcEvent)
    this.refContextMenu.current?.hideTranslateResult()
    if (value) {
      const selectNote = this.notes.find(_ => _.cfi === value)
      this.setState({selectNote, fullReader: true})
      return
    }
    let {selectNote, fullReader, btModal} = this.state
    if (selectNote) {
      this.setState({fullReader: true, selectNote: null})
      return
    }
    if (fullReader) {
      btModal = -1
    }
    this.setState({fullReader: !fullReader, btModal})
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
    this.setState({btModal: -1})
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
    this.hammer.get('pan').set({ enable: false })
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
    let {btModal} = this.state
    btModal = btModal === BT_MODAL.search ? -1 : BT_MODAL.search
    this.setState({btModal})
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
      color: noteColors[0],
    }
    iddb.addNote(note)
    this.reader.addAnnotation(note)
    this.loadNotes()
  }

  private clearSelection = () => {
    this.reader.clearSelection()
  }

  private deleteNote = async () => {
    const {selectNote} = this.state
    this.reader.addAnnotation(selectNote, true)
    this.setState({selectNote: null})
    await iddb.deleteNote(selectNote.id)
    this.loadNotes()
  }

  private publishNote = (view: string) => {
    const {selectNote} = this.state
    selectNote.view = view
    iddb.updateNote(selectNote)
    const i = this.notes.findIndex(_ => _.id === selectNote.id)
    this.notes[i] = selectNote
    this.setState({selectNote: null})
  }

  private toggleShowNotes = () => {
    let {btModal} = this.state
    btModal = btModal === BT_MODAL.note ? -1 : BT_MODAL.note
    this.setState({btModal})
  }

  private setNoteColor = (c) => {
    const {selectNote} = this.state
    selectNote.color = c
    iddb.updateNote(selectNote)
    const i = this.notes.findIndex(_ => _.id === selectNote.id)
    this.notes[i] = selectNote
    this.setState({selectNote: null})
    this.reader.addAnnotation(selectNote)
  }

  private onCodeBlockLangChange = (codeBlockLang) => {
    this.reader.bookUserInfo.set('codeBlockLang', codeBlockLang)
  }

  private handleSearch = (value) => {
    this.setState({btModal: BT_MODAL.search}, () => {
      this.refSearch.current?.search(value)
    })
  }

  private getCurrentChapter = () => {
    return this.reader.getCurrentChapter()
  }

  private getImgs = () => {
    return this.reader.getImgs()
  }

  private setFullReader = () => {
    this.setState({fullReader: true})
  }

  render() {
    const {fullReader, toc, fraction, btModal, pages, page, selection, selectNote} = this.state
    const title = this.reader?.book?.metadata.title
    const reader = this.reader

    const menus = [
      {
        label: (
          <Setting codeBlockLang={this.reader?.bookUserInfo.get('codeBlockLang')} onCodeBlockLangChange={this.onCodeBlockLangChange}/>
        ),
        key: 0
      },
      {
        label: (
          <Button type="text" disabled={!reader?.view?.history.canGoBack}>
            <BackwardOutlined onClick={this.backward}/>
          </Button>
        ),
        key: 1
      },
      {
        label: (
          <Button type="text" disabled={!reader?.view?.history.canGoForward}>
            <ForwardOutlined onClick={this.forward}/>
          </Button>
        ),
        key: 2
      },
      {
        label: <ImgViewer getImgs={this.getImgs} onClose={this.setFullReader}/>,
        key: 3
      },
    ]

    const showSearch = btModal === BT_MODAL.search
    const showNotes = btModal === BT_MODAL.note

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
              {showSearch && <Search ref={this.refSearch} view={reader?.view}/>}
              {
                showNotes &&
                <Notes notes={this.notes} goto={this.goto}/>
              }
            </div>
            <div className="reader-progress">
              <Progress className="reader-progress-bar" type="line" size="small" percent={Math.round(fraction * 100)}
                  strokeColor={color.pr2} showInfo={false}/>
              <div className="reader-progress-text">{page && `${page}/${pages}`}</div>
            </div>
            <div className="footer-btns">
              <Dir toc={toc} goto={this.goto} title={title} getCurrentChapter={this.getCurrentChapter}/>
              <Button className="search" type="text" size="large" icon={<SearchOutlined/>} onClick={this.toggleSearch}></Button>
              <Button type="text" size="large" icon={<EditOutlined />} onClick={this.toggleShowNotes}></Button>
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
        <ContextMenu ref={this.refContextMenu} selection={selection} selectNote={selectNote} addNote={this.handleNote}
          clearSelection={this.clearSelection} deleteNote={this.deleteNote} publishNote={this.publishNote} setNoteColor={this.setNoteColor}
          onSearch={this.handleSearch}/>
      </div>
    )
  }
}
