import './index.less'
import React from 'react'
import iddb from '~/storage/iddb'
import {getBook, mountBook} from '~/utils/reader'
import {LeftOutlined, RightOutlined} from '@ant-design/icons'
import {Button} from 'antd'
import {EPUB} from '~/foliate-js/epub'
import Dir from './Dir'
import Hammer from 'hammerjs'
import Storage from '~/storage/localStorage'

interface IProps {
  searchParams: any,
}

interface IState {
  sections: EPUB['sections'],
  sectionIndex: number,
  view?: any,
  toc: any[],
  showFooter: boolean,
}

export default class Book extends React.Component<IProps, IState> {
  private refReader = React.createRef<HTMLDivElement>()
  private book
  private id: number
  private hammer: Hammer
  private bookUserInfo: Storage
  public state: IState = {
    sections: [],
    sectionIndex: 0,
    toc: [],
    showFooter: true,
  }

  async componentDidMount() {
    if (!this.refReader.current) {
      return
    }
    const {searchParams} = this.props
    const id = Number(searchParams.get('id'))
    this.bookUserInfo = new Storage('book-userinfo', id)
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
      view
    })
    view.goToFraction(fraction)
    view.addEventListener('relocate', this.handleRelocate)
    view.addEventListener('load', this.handleLoad)
  }

  componentWillUnmount() {
    this.state.view?.removeEventListener('relocate', this.handleRelocate)
    this.state.view?.removeEventListener('load', this.handleLoad)
    this.state.view?.renderer.destroy()
    this.bookUserInfo?.set('accessTime', Date.now())
  }

  private handleRelocate = (e) => {
    const {fraction} = e.detail
    this.bookUserInfo.set('fraction', fraction)
  }

  private handleTap = () => {
    const {showFooter} = this.state
    this.setState({showFooter: !showFooter})
  }

  private handleDoubleTap = () => {
    if (document.fullscreen) {
      document.exitFullscreen()
    } else {
      document.body.requestFullscreen()
    }
  }

  private handleLoad = (e) => {
    this.hammer?.off('tap', this.handleTap)
    this.hammer?.off('doubletap', this.handleDoubleTap)
    this.hammer = new Hammer(e.detail.doc)
    this.hammer.on('tap', this.handleTap)
    this.hammer.on('doubletap', this.handleDoubleTap)
    this.setState({sectionIndex: e.detail.index})
  }

  private prev = () => {
    this.state.view?.renderer.prevSection()
  }

  private next = () => {
    this.state.view?.renderer.nextSection()
  }

  private goto = (href) => {
    this.state.view?.goTo(href)
  }

  render() {
    const {showFooter, sectionIndex, sections, toc} = this.state
    return (
      <div className="reader-wrapper">
        <div className="reader" ref={this.refReader}></div>
        {
          showFooter &&
          <div className="footer">
            <Button className="prev" icon={<LeftOutlined/>} disabled={sectionIndex === 0} onClick={this.prev}></Button>
            <Dir toc={toc} goto={this.goto}/>
            <Button className="next" icon={<RightOutlined/>} disabled={sectionIndex === sections.length - 1} onClick={this.next}></Button>
          </div>
        }
      </div>
    )
  }
}
