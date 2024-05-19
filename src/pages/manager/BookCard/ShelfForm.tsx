import React, {useCallback, useState} from 'react'
import {Button, Form, Input, Modal, Select} from 'antd'

const {Option} = Select
const {Item} = Form

const formName = 'shelf'

function ShelfForm({bookId, shelfs, onFinish}) {
  const [open, setOpen] = useState(false)
  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])
  const handleFinish = useCallback((e) => {
    onFinish({...e, bookId})
    setOpen(false)
  }, [bookId, onFinish])

  const footer = (
    <Button form={formName} key="submit" htmlType="submit">
      确定
    </Button>
  )

  return (
    <>
      <Button type="text"  onClick={handleOpen}>加入书架</Button>
      <Modal maskClosable open={open} footer={footer} onCancel={handleClose}>
        <Form className="shelf-form" name={formName} onFinish={handleFinish} initialValues={{shelfId: ''}}>
          <Item label="选择" name="shelfId">
            <Select size="large">
              <Option value="">新建书架</Option>
              {shelfs.map(s => <Option value={s.id}>{s.name}</Option>)}
            </Select>
          </Item>
          <Item label="新建" name="newShelf">
            <Input size="large"/>
          </Item>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(ShelfForm)
