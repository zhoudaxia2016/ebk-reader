import React from 'react'
import {SettingOutlined} from '@ant-design/icons'
import {Button, Drawer, Form, Input} from 'antd'
import {userInfoStorage} from '~/storage/localStorage'
import {translator} from '~/utils/openai'

interface IProps {
}

interface IState {
  show?: boolean,
  openaiHost: string,
}

const formName = 'setting'

export default class Setting extends React.PureComponent<IProps, IState> {

  public state: IState = {
    openaiHost: userInfoStorage.get('openaiHost')
  }

  private open = () => {
    this.setState({show: true})
  }

  private close = () => {
    this.setState({show: false})
  }

  private handleFinish = ({openaiHost}) => {
    userInfoStorage.set('openaiHost', openaiHost)
    translator.init(openaiHost)
    this.close()
  }

  render() {
    const {show, openaiHost} = this.state
    return (
      <>
        <Button type="text" onClick={this.open}><SettingOutlined/></Button>
        <Drawer rootClassName="setting-container" title="阅读配置" open={show} placement="bottom" height="auto" closeIcon={null} onClose={this.close}>
          <Form className="setting-form" name={formName} onFinish={this.handleFinish} initialValues={{openaiHost}}>
            <Form.Item name="openaiHost">
              <Input autoFocus size="large" autoComplete="off"/>
            </Form.Item>
          </Form>
          <Button form={formName} key="submit" htmlType="submit">
            确定
          </Button>
        </Drawer>
      </>
    )
  }
}
