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
}

export default class Book extends React.Component<IProps, IState> {
  private refReaderContainer = React.createRef<HTMLDivElement>()
  private book
  private id: number
  private hammer: Hammer
  private startTouch: any
  private touchStartTime: number
  private reader: Reader
  public state: IState = {
    sections: [],
    sectionIndex: 0,
    toc: [],
    fullReader: false,
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
    const reader = new Reader(id, this.handleRelocate, this.handleLoad)
    await reader.init(this.refReaderContainer.current)
    this.reader = reader
    const fraction = reader.bookUserInfo.get('fraction')
    this.setState({
      sections: reader.book.sections,
      toc: reader.book.toc,
      fraction,
    })
  }

  componentWillUnmount() {
    this.reader?.destroy()
    this.reader = null
  }

  private handleRelocate = ({fraction}) => {
    this.setState({fraction})
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

  private handleLoad = ({doc, index}) => {
    this.hammer?.off('tap', this.handleTap)
    this.hammer?.off('doubletap', this.handleDoubleTap)
    this.hammer = new Hammer(doc)
    this.hammer.on('tap', this.handleTap)
    this.hammer.on('doubletap', this.handleDoubleTap)
    this.setState({sectionIndex: index})
    doc.addEventListener('touchstart', this.handleTouchStart)
    doc.addEventListener('touchend', this.handleTouchEnd)
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

  render() {
    const {fullReader, toc, fraction, showSearch} = this.state
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
