import React from 'react'
import {SettingOutlined} from '@ant-design/icons'
import {Button, Checkbox, Divider, Drawer, Form, Input, Select} from 'antd'
import {userInfoStorage} from '~/storage/localStorage'
import {translator} from '~/utils/openai'
import {supportLangs} from '~/utils/reader/highlight'

const {Option} = Select

interface IProps {
  codeBlockLang: string,
  onCodeBlockLangChange: (codeBlockLang: string) => void,
}

interface IState {
  show?: boolean,
  openaiHost: string,
  horizontal: boolean,
}

const formName = 'setting'

export default class Setting extends React.PureComponent<IProps, IState> {

  public state: IState = {
    openaiHost: userInfoStorage.get('openaiHost'),
    horizontal: userInfoStorage.get('horizontal') === '1',
  }

  private open = () => {
    this.setState({show: true})
  }

  private close = () => {
    this.setState({show: false})
  }

  private handleFinish = ({openaiHost, codeBlockLang, horizontal}) => {
    userInfoStorage.set('openaiHost', openaiHost)
    userInfoStorage.set('horizontal', horizontal ? '1' : '0')
    const {onCodeBlockLangChange} = this.props
    onCodeBlockLangChange(codeBlockLang)
    translator.init(openaiHost)
    this.close()
  }

  render() {
    const {codeBlockLang} = this.props
    const {show, openaiHost, horizontal} = this.state
    return (
      <>
        <Button type="text" onClick={this.open}><SettingOutlined/></Button>
        <Drawer rootClassName="setting-container" title="阅读配置" open={show} placement="bottom" height="auto" closeIcon={null} onClose={this.close}>
          <Form className="setting-form" name={formName} onFinish={this.handleFinish} initialValues={{openaiHost, codeBlockLang, horizontal}}>
            <Form.Item name="openaiHost" label="openai-host">
              <Input autoFocus size="large" autoComplete="off"/>
            </Form.Item>
            <Form.Item name="horizontal" valuePropName="checked">
              <Checkbox>强制横排</Checkbox>
            </Form.Item>
            <Divider/>
            <Form.Item name="codeBlockLang" label="代码块默认语言（需要reload生效）">
              <Select size="large">
                <Option value="">auto</Option>
                {supportLangs.map(l => {
                    return <Option key={l} value={l}>{l}</Option>
                })}
            </Select>
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
