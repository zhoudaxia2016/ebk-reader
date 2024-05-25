import React from 'react'
import {EllipsisOutlined} from '@ant-design/icons'
import {Dropdown, notification} from 'antd'
import Backup from './Backup'
import Restore from './Restore'
import BackupConfig from './BackupConfig'
import RestoreConfig from './RestoreConfig'
import {isMobile} from '~/utils/userAgent'

export default function MoreMenu({onRestoreComplete, getBookUserInfo, getMd5Set}) {
  const [notice, contextHolder] = notification.useNotification()
  const menuItems = [
    {label: <BackupConfig getBookUserInfo={getBookUserInfo}/>, key: 3},
    {label: <RestoreConfig getBookUserInfo={getBookUserInfo} onComplete={onRestoreComplete}/>, key: 4},
  ]
  if (!isMobile) {
    menuItems.push(...[
      {label: <Backup getBookUserInfo={getBookUserInfo}/>, key: 1},
      {label: <Restore notice={notice} onComplete={onRestoreComplete}
        getBookUserInfo={getBookUserInfo} getMd5Set={getMd5Set}/>, key: 2},
    ])
  }
  return (
    <>
      {contextHolder}
      <Dropdown menu={{items: menuItems}}>
        <EllipsisOutlined/>
      </Dropdown>
    </>
  )
}
