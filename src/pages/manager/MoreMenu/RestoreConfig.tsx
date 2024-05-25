import {Button} from 'antd'
import React, {useCallback, useRef} from 'react'
import iddb from '~/storage/iddb'
import {toText} from '~/utils/fileReader'

export default function BackupConfig({getBookUserInfo, onComplete}) {
  const refRestoreInput = useRef(null)
  const handleRestore = useCallback(() => {
    refRestoreInput.current?.click()
  }, [])

  const handleRestoreInputChange = useCallback(async (e) => {
    const file = e.target.files[0]
    const text = await toText(file)
    const bookUserInfo = getBookUserInfo()
    const booksInfo = await iddb.getAllBookInfo()
    const config = JSON.parse(text)
    config.forEach(({md5, config}) => {
      const info = booksInfo.find(_ => _[1].md5 === md5)
      if (info) {
        const oldUserInfo = bookUserInfo.get(info[0])
        if (oldUserInfo && oldUserInfo.accessTime > config.accessTime) {
          return
        }
        bookUserInfo.set(info[0], config)
      }
    })
    onComplete()
  }, [getBookUserInfo, onComplete])
  return (
    <>
      <Button type="text" onClick={handleRestore}>导入配置</Button>
      <input ref={refRestoreInput} className="file-input" type="file" accept=".json" onChange={handleRestoreInputChange}/>
    </>
  )
}
