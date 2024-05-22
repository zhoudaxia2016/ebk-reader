import {Button} from 'antd'
import React, {useCallback, useRef} from 'react'
import {backupZip, backupBookFolder, backupConfig} from './config'
import iddb from '~/storage/iddb'
import JSZip from 'jszip'
import {parseFileName} from '../utils'
import streamSaver from 'streamsaver'
import ProgressModal from '~/components/ProgressModal'
import {isMobile} from '~/utils/userAgent'

export default function Backup({getBookUserInfo}) {
  const refProgress = useRef<ProgressModal>()
  const handleBackup = useCallback(async () => {
    refProgress.current.open()
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
    const writeStream = streamSaver.createWriteStream(backupZip).getWriter()
    if (isMobile) {
      zip.generateInternalStream({type: 'uint8array'})
        .on('data', (data, metadata) => {
          refProgress.current.updatePercent(metadata.percent)
          writeStream.write(data)
        })
        .on('error', err => console.error(err))
        .on('end', () => {
          writeStream.close()
          refProgress.current.close()
        })
        .resume()
      return
    }
    zip.generateAsync({type: 'blob'}, function(metadata) {
      refProgress.current.updatePercent(metadata.percent)
    }).then(function(content) {
      refProgress.current.close()
      const fileStream = streamSaver.createWriteStream(backupZip, {
        size: content.size,
      })
      const readableStream = content.stream()
      readableStream.pipeTo(fileStream)
    })
  }, [])

  return (
    <>
      <ProgressModal title="正在生成备份..." ref={refProgress}/>
      <Button type="text" onClick={handleBackup}>备份</Button>
    </>
  )
}
