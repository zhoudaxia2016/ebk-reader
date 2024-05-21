import React from 'react'
import {Modal, Progress} from 'antd'

interface IProps {
  title: string,
}

interface IState {
  showProgress: boolean,
  percent: number,
}

export default class ProgressModal extends React.PureComponent<IProps, IState> {
  public state = {
    showProgress: false,
    percent: 0,
  }

  public open() {
    this.setState({showProgress: true, percent: 0})
  }

  public close() {
    this.setState({showProgress: false})
  }

  public updatePercent(percent: number) {
    this.setState({percent: Math.round(percent)})
  }

  private handleCancel = () => {
    this.close()
  }

  render() {
    const {title} = this.props
    const {showProgress, percent} = this.state
    return (
      <Modal open={showProgress} title={title} footer={null} maskClosable={false} onCancel={this.handleCancel}>
        <Progress percent={percent}/>
      </Modal>
    )
  }
}
