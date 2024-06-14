import './index.less'
import {EnterOutlined} from '@ant-design/icons'
import {Button, Input, InputRef, notification, Tooltip} from 'antd'
import React from 'react'
import {translator} from '~/utils/openai'
import {noteColors} from '../config'
import {ISelection, INote} from './types'

interface IProps {
  selection?: ISelection,
  clearSelection: () => void,
  selectNote?: INote,
  addNote: () => void,
  deleteNote: () => void,
  setNoteColor: (color: string) => void,
  publishNote: (view: string) => void,
}

interface IState {
  translateResult?: string,
}

export default class ContextMenu extends React.PureComponent<IProps, IState> {
  public state: IState = {
  }

  private refNoteInput = React.createRef<InputRef>()

  componentDidUpdate(prevProps) {
    if (!prevProps.selectNote && this.props.selectNote) {
      // TODO: 解决失焦问题，删除这段代码
      setTimeout(() => {
        this.refNoteInput.current?.focus()
      }, 50)
    }
  }

  private handleTranslate = async () => {
    const {text} = this.props.selection
    const translateResult = await translator.translate(text)
    if (!translateResult) {
      notification.open({message: '请设置openai host'})
      return
    }
    this.setState({translateResult})
  }

  private publishNote = () => {
    const value = this.refNoteInput.current.input.value
    const {publishNote} = this.props
    publishNote(value)
  }

  private renderColorOptions() {
    const {setNoteColor} = this.props
    const colors = noteColors.map(c => (
      <div key={c} className="note-color-item" style={{background: c}} onClick={() => setNoteColor(c)}></div>
    ))
    return <div className="note-colors">{colors}</div>
  }

  private handleCopy = () => {
    const {text} = this.props.selection
    navigator.clipboard.writeText(text).then(() => {
      notification.open({message: '复制成功'})
    }).catch(err => {
      notification.open({message: '复制失败：' + err})
    })
  }

  public hideTranslateResult() {
    this.setState({translateResult: ''})
  }

  public getNoteInput() {
    return this.refNoteInput.current.input
  }

  render() {
    const {selection, selectNote, addNote, deleteNote, clearSelection} = this.props
    const {translateResult} = this.state
    return (
      <>
        {
          selection &&
          <div className="context-menu" style={{left: selection.x, top: selection.y}} onClick={clearSelection}>
            <div className="context-menu-item" onClick={addNote}>标记</div>
            <div className="context-menu-item" onClick={this.handleTranslate}>翻译</div>
            <div className="context-menu-item" onClick={this.handleCopy}>复制</div>
          </div>
        }
        {
          selectNote &&
          <div className="note-modal">
            <div className="note-modal-header">
              <div className="note-modal-text">{selectNote.text}</div>
              <div className="note-modal-btns">
                <Button type="text" onClick={deleteNote}>删除</Button>
              </div>
            </div>
            <Input ref={this.refNoteInput} defaultValue={selectNote.view} suffix={
              <>
                <Tooltip placement="top" title={this.renderColorOptions()}>
                  <div className="note-color-btn" style={{background: selectNote.color}}></div>
                </Tooltip>
                <Button type="text" onClick={this.publishNote}><EnterOutlined/></Button>
              </>
              }
            />
          </div>
        }
        {
          translateResult &&
          <div className="translate-result">
            {translateResult}
          </div>
        }
      </>
    )
  }
}
