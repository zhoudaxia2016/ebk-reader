import React from 'react'
import {EllipsisOutlined} from '@ant-design/icons'
import {Dropdown, notification} from 'antd'
import Backup from './Backup'
import Restore from './Restore'

export default function MoreMenu({onRestoreComplete, getBookUserInfo, getMd5Set}) {
  const [notice, contextHolder] = notification.useNotification()
  const menuItems = [
    {label: <Backup getBookUserInfo={getBookUserInfo}/>, key: 1},
    {label: <Restore notice={notice} onComplete={onRestoreComplete}
              getBookUserInfo={getBookUserInfo} getMd5Set={getMd5Set}/>, key: 2},
  ]
  return (
    <>
      {contextHolder}
      <Dropdown menu={{items: menuItems}}>
        <EllipsisOutlined/>
      </Dropdown>
    </>
  )
}
