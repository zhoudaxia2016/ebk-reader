import './index.less'
import React from 'react'
import {Input} from 'antd'
import {SearchOutlined} from '@ant-design/icons'
import {debounce} from '~/utils/lodash'

interface IProps {
  notes: INote[],
  goto: (href: string) => void,
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


interface IState {
  isComp: boolean,
  filterNotes?: INote[],
}

export default class Search extends React.PureComponent<IProps, IState> {
  public state: IState = {
    isComp: false,
  }

  private handleCompositionStart = () => {
    this.setState({isComp: true})
  }

  private handleCompositionEnd = () => {
    this.setState({isComp: false})
  }

  private handleChange = debounce(async ({target: {value}}) => {
    if (this.state.isComp) {
      return
    }
    if (!value) {
      this.setState({filterNotes: null})
    }
    let {notes} = this.props
    notes = notes.filter(_ => _.text.includes(value))
    this.setState({filterNotes: notes})
  })

  private renderResults() {
    const {notes, goto} = this.props
    const {filterNotes = notes} = this.state
    return (
      <div className="notes-list">
        {filterNotes.map((n) => (
          <div key={n.id} className="note" onClick={() => goto(n.cfi)}>
            <div className="note-text">{n.text}</div>
            <div className="note-view">{n.view}</div>
          </div>
        ))}
      </div>
    )
  }

  render() {
    return (
      <div className="book-notes">
        <Input className="book-notes-input" prefix={<SearchOutlined/>} placeholder="搜索笔记"
          onChange={this.handleChange} onCompositionStart={this.handleCompositionStart} onCompositionEnd={this.handleCompositionEnd}/>
        {this.renderResults()}
      </div>
    )
  }
}
