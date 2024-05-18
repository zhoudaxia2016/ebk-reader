import React, {useCallback, useRef} from 'react'
import {Button} from 'antd'
import {backupBookFolder, backupConfig} from './config'
import {parseFileName, saveBooks} from '../utils'
import {loadAsync} from 'jszip'

export default function Backup({notice, getMd5Set, getBookUserInfo, onComplete}) {
  const handleRestoreInputChange = useCallback(async (e) => {
    const file = e.target.files[0]
    const {files, config} = await loadAsync(file).then(async res => {
      const files = []
      res.folder(backupBookFolder).forEach((name, data) => files.push([name, data]))
      const result = await Promise.all(files.map(async ([name, data]) => {
        return data.async('arraybuffer').then(async data => {
          return {name, data}
        })
      }))
      const config = await res.files[backupConfig].async('string')
      return {files: result, config: JSON.parse(config)}
    })
    const {successFiles, failFiles} = await saveBooks(files, getMd5Set(), true)
    successFiles.forEach((file) => {
      const {name = ''} = parseFileName(file.name)
      if (!name) {
        return
      }
      const bookUserInfo = getBookUserInfo()
      bookUserInfo.set(file.id, config[name])
    })
    const bookNum = files.length
    const failNum = failFiles.length
    if (failFiles.length > 0) {
      notice.warning({
        message: `成功从备份导入${bookNum - failNum}本，导入失败书籍(${failNum}本)：`,
        description: failFiles.map((_, i) => <div key={i}>{_.name}</div>),
        duration: 3,
      })
    } else {
      notice.success({
        message: `成功从备份导入${bookNum}本书籍`,
        duration: 1,
      })
    }
    onComplete(successFiles, failFiles)
  }, [])

  const handleRestore = useCallback(() => {
    refRestoreInput.current?.click()
  }, [])

  const refRestoreInput = useRef(null)
  return (
    <>
      <Button type="text" onClick={handleRestore}>导入</Button>
      <input ref={refRestoreInput} className="file-input" type="file" accept=".zip" onChange={handleRestoreInputChange}/>
    </>
  )
}
