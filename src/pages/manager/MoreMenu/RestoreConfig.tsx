import {Button} from 'antd'
import React, {useCallback, useRef} from 'react'
import iddb from '~/storage/iddb'
import {toText} from '~/utils/fileReader'
import {bookUserInfoStorage, shelfStorage} from '~/storage/localStorage'

export default function BackupConfig({onComplete}) {
  const refRestoreInput = useRef(null)
  const handleRestore = useCallback(() => {
    refRestoreInput.current?.click()
  }, [])

  const handleRestoreInputChange = useCallback(async (e) => {
    const file = e.target.files[0]
    const text = await toText(file)
    const booksInfo = await iddb.getAllBookInfo()
    const config = JSON.parse(text)
    const shelfs = shelfStorage.getAll()
    let id = Date.now()
    const newShelfs = []
    config.bookConfig.forEach(({md5, config}) => {
      const info = booksInfo.find(_ => _[1].md5 === md5)
      let isUpdate = false
      if (info) {
        const userInfo = bookUserInfoStorage.get(info[0]) || {}
        if (!userInfo.accessTime || userInfo.accessTime < config.accessTime) {
          isUpdate = true
          userInfo.accessTime = config.accessTime
        }
        // 由于书架是软删除，书籍配置的书架id可能已经删除
        if (userInfo.shelf && !shelfs.find(_ => _.id === userInfo.shelf)) {
          delete userInfo.shelf
        }
        if (!userInfo.shelf && config.shelf) {
          isUpdate = true
          const shelf = shelfs.find(_ => _.name === config.shelf)
          if (shelf) {
            userInfo.shelf = shelf.id
          } else {
            const newShelf = {id: id++, name: config.shelf}
            newShelfs.push(newShelf)
            shelfs.push(newShelf)
            userInfo.shelf = newShelf.id
          }
        }
        if (isUpdate) {
          bookUserInfoStorage.set(info[0], userInfo)
        }
      }
    })
    shelfStorage.add(newShelfs)
    onComplete()
  }, [onComplete])
  return (
    <>
      <Button type="text" onClick={handleRestore}>导入配置</Button>
      <input ref={refRestoreInput} className="file-input" type="file" accept=".json" onChange={handleRestoreInputChange}/>
    </>
  )
}
