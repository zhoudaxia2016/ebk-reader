import {Button} from 'antd'
import React, {useCallback} from 'react'
import {backupZip, backupBookFolder, backupConfig} from './config'
import iddb from '~/storage/iddb'
import JSZip from 'jszip'
import {parseFileName} from '../utils'
import {saveAs} from 'file-saver'

export default function Backup({getBookUserInfo}) {
  const handleBackup = useCallback(async () => {
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
    zip.generateAsync({type: 'blob'}).then(function(content) {
      saveAs(content, backupZip)
    })
  }, [])

  return (
    <Button type="text" onClick={handleBackup}>备份</Button>
  )
}
