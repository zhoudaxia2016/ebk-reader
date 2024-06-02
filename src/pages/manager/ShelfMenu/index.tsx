import './index.less'
import React from 'react'
import {UnorderedListOutlined} from '@ant-design/icons'
import {Dropdown, Button, Modal, Form, Input} from 'antd'
import {shelfStorage} from '~/storage/localStorage'

interface IProps {
  selectShelf: number,
  onRename: () => void,
  onDeleteEmpty: () => void,
  onDelete: () => void,
}

interface IState {
  showRename?: boolean,
}

const formName = 'rename-shelf'

export default class ShelfMenu extends React.PureComponent<IProps, IState> {
  public state: IState = {
  }

  private openRename = () => {
    this.setState({showRename: true})
  }
  private closeRename = () => {
    this.setState({showRename: false})
  }

  private handleFinish = ({name}) => {
    this.closeRename()
    if (!name) {
      return
    }
    const {selectShelf} = this.props
    const shelf = shelfStorage.get(selectShelf)
    shelf.name = name
    shelfStorage.set(selectShelf, shelf)
    this.props.onRename()
  }

  render() {
    const {selectShelf, onDeleteEmpty, onDelete} = this.props
    const {showRename} = this.state

    const shelfMenus = [
      {label: <Button type="text" disabled={!selectShelf} onClick={this.openRename}>重命名</Button>, key: 0},
      {label: <Button type="text" disabled={!selectShelf} onClick={onDelete}>删除书架</Button>, key: 1},
      {label: <Button type="text" onClick={onDeleteEmpty}>删除空书架</Button>, key: 2},
    ]

    const name = shelfStorage.get(selectShelf)?.name

    const footer = (
      <Button form={formName} key="submit" htmlType="submit">
        确定
      </Button>
    )

    return (
      <>
        <Modal className="rename-shelf-form-modal" maskClosable open={showRename} footer={footer} onCancel={this.closeRename} title="重命名书架" destroyOnClose>
          <Form className="rename-shelf-form" name={formName} onFinish={this.handleFinish} initialValues={{name}}>
            <Form.Item name="name">
              <Input autoFocus size="large" autoComplete="off"/>
            </Form.Item>
          </Form>
        </Modal>
        <Dropdown className="shelf-menus" menu={{items: shelfMenus}} trigger={['click']}>
          <Button><UnorderedListOutlined/></Button>
        </Dropdown>
      </>
    )
  }
}
