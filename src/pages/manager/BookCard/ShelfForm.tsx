import React, {useCallback, useState} from 'react'
import {Button, Form, Input, Modal, Select, notification, Dropdown} from 'antd'
import {bookUserInfoStorage} from '~/storage/localStorage'

const {Option} = Select
const {Item} = Form

const formName = 'shelf'

function ShelfForm({bookId, shelfs = [], onFinish}) {
  const [open, setOpen] = useState(false)
  const [notice, contextHolder] = notification.useNotification()
  const [selectShelf, setSelectShelf] = useState('')
  const handleOpen = useCallback(() => {
    const userInfo = bookUserInfoStorage.get(bookId)
    if (userInfo?.shelf && shelfs.some(_ => _.id === userInfo.shelf)) {
      setSelectShelf(userInfo.shelf)
    } else {
      setSelectShelf('')
    }
    setOpen(true)
  }, [bookId, shelfs])
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])
  const handleFinish = useCallback((e) => {
    if (!e.shelfId && shelfs.some(_ => _.name === e.newShelf)) {
      notice.warning({
        message: '已经存在该书架',
      })
      return
    }
    onFinish({...e, bookId})
    setOpen(false)
  }, [bookId, onFinish])
  
  const handleShelfChange = useCallback((id) => {
    setSelectShelf(id)
  }, [])

  const footer = (
    <Button form={formName} key="submit" htmlType="submit">
      确定
    </Button>
  )

  return (
    <>
      {contextHolder}
      <Button type="text"  onClick={handleOpen}>加入书架</Button>
      <Modal className="shelf-form-modal" maskClosable open={open} footer={footer} onCancel={handleClose} title="加入书架">
        <Form className="shelf-form" name={formName} onFinish={handleFinish} initialValues={{shelfId: selectShelf}}>
          <Item label="选择" name="shelfId">
            <Select size="large" onChange={handleShelfChange}>
              <Option value="">新建书架</Option>
              {shelfs.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Item>
          <Item label="新建" name="newShelf">
            <Input size="large" disabled={!!selectShelf}/>
          </Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(ShelfForm)
