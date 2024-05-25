import React, {useCallback, useRef} from 'react'
import {Button} from 'antd'
import {backupConfig} from './config'
import {saveBooks} from '../utils'
import {loadAsync} from 'jszip'
import ProgressModal from '~/components/ProgressModal'

export default function Backup({notice, getMd5Set, getBookUserInfo, onComplete}) {
  const refProgress = useRef<ProgressModal>()
  const handleRestoreInputChange = useCallback(async (e) => {
    const file = e.target.files[0]
    const {files, allConfig} = await loadAsync(file).then(async res => {
      const files = []
      res.forEach((name, data) => !/json$/.test(name) && files.push([name, data]))
      const result = await Promise.all(files.map(async ([name, data]) => {
        return data.async('arraybuffer').then(async data => {
          return {name, data}
        })
      }))
      const config = await res.files[backupConfig].async('string')
      return {files: result, allConfig: JSON.parse(config)}
    })
    refProgress.current.open()
    const {successFiles, failFiles} = await saveBooks({files, md5Set: getMd5Set(), isBuffer: true, onProgress: (p) => refProgress.current.updatePercent(p)})
    refProgress.current.close()
    const bookUserInfo = getBookUserInfo()
    successFiles.forEach(({id, md5}) => {
      const config = allConfig.find(_ => _.md5 === md5)
      if (config) {
        bookUserInfo.set(id, config.config)
      }
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
      <ProgressModal ref={refProgress} title="正在从备份导入..."/>
      <Button type="text" onClick={handleRestore}>导入</Button>
      <input ref={refRestoreInput} className="file-input" type="file" accept=".zip" onChange={handleRestoreInputChange}/>
    </>
  )
}
