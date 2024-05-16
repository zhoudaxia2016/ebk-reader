import './index.less'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Input, notification} from 'antd'
import {PlusOutlined, SearchOutlined} from '@ant-design/icons'
import {getBook} from '~/utils/reader'
import iddb from '~/storage/iddb'
import {toArrayBuffer} from '~/utils/fileReader'
import BookCard from './BookCard'
import Storage from '~/storage/localStorage'
import CryptoJS from 'crypto-js'

function getMd5(data) {
  const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(data))
  return hash.toString(CryptoJS.enc.Hex)
}

export default function Manager() {
  const [books, setBooks] = useState<any[]>([])
  const [notice, contextHolder] = notification.useNotification();
  const refFileInput = useRef<HTMLInputElement>(null)
  const refBookUserInfo = useRef<any>()

  const loadBooks = async () => {
    const books = await iddb.getAllBooks()
    books.sort((a, b) => {
      const atime = refBookUserInfo.current.get(a.id)?.accessTime || a.createTime
      const btime = refBookUserInfo.current.get(b.id)?.accessTime || b.createTime
      return btime - atime
    })
    setBooks(books)
  }

  const handleClickImport = useCallback(() => {
    refFileInput.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e) => {
    const md5Set = new Set(books.map(_ => _.md5))
    const duplicateFiles = []
    await Promise.all([...e.target.files].map(async file => {
      const book: any = await getBook(file)
      const data = await toArrayBuffer(file)
      const md5 = getMd5(data)
      if (md5Set.has(md5)) {
        duplicateFiles.push(file.name)
        return
      }
      const cover = await book.getCover()
      const createTime = Date.now()
      await iddb.addBook(data, {createTime, cover, name: file.name, type: file.type, md5, ...book.metadata})
    }))
    const bookNum = e.target.files.length
    const duplicateNum = duplicateFiles.length
    if (duplicateFiles.length > 0) {
      notice.warning({
        message: `成功导入${bookNum - duplicateNum}本，有重复书籍(${duplicateNum}本)：`,
        description: duplicateFiles.map(_ => <div>{_}</div>),
        duration: 3,
      })
    } else {
      notice.success({
        message: `成功导入${bookNum}本书籍`,
        duration: 1,
      })
    }
    loadBooks()
  }, [books, notice])

  useEffect(() => {
    refBookUserInfo.current = new Storage('book-userinfo')
    loadBooks()
  }, [])

  const handleDelete = useCallback(async (id) => {
    await iddb.deleteBook(id)
    loadBooks()
  }, [])

  return (
    <div className="manager">
      {contextHolder}
      <div className="manager-header">
        <input ref={refFileInput} className="file-input" multiple type="file" accept=".epub,.mobi,.azw3,fb2,cbz" onChange={handleFileChange}/>
        <Input className="search-input"
          prefix={<SearchOutlined/>}
          suffix={<PlusOutlined className="import-btn" onClick={handleClickImport}/>}
        />
      </div>
      <div className="manager-books-wrapper">
        <div className="manager-books">
          {books.map((book) => (<BookCard key={book.id} info={book} onDelete={handleDelete}/>))}
        </div>
      </div>
    </div>
  )
}
