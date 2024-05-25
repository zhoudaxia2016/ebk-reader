import {Button} from 'antd'
import React, {useCallback} from 'react'
import iddb from '~/storage/iddb'
import {getExportConfig} from './Backup'
import {saveAs} from 'file-saver'
import {backupConfig} from './config'

export default function BackupConfig({getBookUserInfo}) {
  const handleBackup = useCallback(async () => {
    const booksInfo = await iddb.getAllBookInfo()
    const config = getExportConfig(getBookUserInfo().getAll(), booksInfo)
    const blob = new Blob([config], {type: 'text/plain;charset=utf-8'})
    saveAs(blob, backupConfig)
  }, [getBookUserInfo])
  return (
    <Button type="text" onClick={handleBackup}>备份配置</Button>
  )
}
