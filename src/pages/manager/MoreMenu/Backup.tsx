import {Button, Modal, Progress} from 'antd'
import React, {useCallback, useState} from 'react'
import {backupZip, backupBookFolder, backupConfig} from './config'
import iddb from '~/storage/iddb'
import JSZip from 'jszip'
import {parseFileName} from '../utils'
import {saveAs} from 'file-saver'

export default function Backup({getBookUserInfo}) {
  const [percent, setPercent] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const handleBackup = useCallback(async () => {
    setShowProgress(true)
    const books = await iddb.getAllBookData()
    const booksInfo = await iddb.getAllBookInfo()
    const zip = new JSZip()
    books.forEach(([id, data]) => {
      const info = booksInfo.find(_ => _[0] === id)
      const {ext = ''} = parseFileName(info[1].name)
      if (!ext) {
        return
      }
      const bookFolder = zip.folder(backupBookFolder)
      bookFolder.file(`${id}.${ext}`, data)
    })
    const bookUserInfo = getBookUserInfo()
    const config = bookUserInfo.getAll()
    zip.file(backupConfig, JSON.stringify(config))
    zip.generateAsync({type: 'blob'}, function(metadata) {
      setPercent(Math.round(metadata.percent))
    }).then(function(content) {
      setPercent(0)
      setShowProgress(false)
      saveAs(content, backupZip)
    })
  }, [])
  const handleCancel = useCallback(() => {
    setShowProgress(false)
    setPercent(0)
  }, [])

  return (
    <>
      <Modal open={showProgress} title="正在生成备份..." footer={null} maskClosable={false} onCancel={handleCancel}>
        <Progress className="backup-progress" percent={percent}/>
      </Modal>
      <Button type="text" onClick={handleBackup}>备份</Button>
    </>
  )
}
