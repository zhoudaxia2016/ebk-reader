import {Button} from 'antd'
import React, {useCallback, useRef} from 'react'
import {backupZip, backupConfig} from './config'
import iddb from '~/storage/iddb'
import JSZip from 'jszip'
import {parseFileName} from '../utils'
import ProgressModal from '~/components/ProgressModal'
import {saveAs} from 'file-saver'

export default function Backup({getBookUserInfo}) {
  const refProgress = useRef<ProgressModal>()
  const handleBackup = useCallback(async () => {
    refProgress.current.open()
    const books = await iddb.getAllBookData()
    const booksInfo = await iddb.getAllBookInfo()
    const zip = new JSZip()
    books.forEach(([id, data]) => {
      const info = booksInfo.find(_ => _[0] === id)
      const {name} = info[1]
      const {ext = ''} = parseFileName(name)
      if (!ext) {
        return
      }
      zip.file(`${name}.${ext}`, data)
    })
    const bookUserInfo = getBookUserInfo()
    const bookUserInfoConfig = bookUserInfo.getAll()
    const config = Object.keys(bookUserInfoConfig).map(id => {
      const info = booksInfo.find(_ => _[0] === Number(id))
      if (!info) {
        return
      }
      return {
        md5: info[1].md5,
        config: bookUserInfoConfig[id]
      }
    }).filter(_ => _)
    zip.file(backupConfig, JSON.stringify(config))
    zip.generateAsync({type: 'blob'}, function(metadata) {
      refProgress.current.updatePercent(metadata.percent)
    }).then(function(content) {
      refProgress.current.close()
      saveAs(content, backupZip)
    })
  }, [])

  return (
    <>
      <ProgressModal title="正在生成备份..." ref={refProgress}/>
      <Button type="text" onClick={handleBackup}>备份</Button>
    </>
  )
}
