import './index.less'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Input} from 'antd'
import {PlusOutlined, SearchOutlined} from '@ant-design/icons'
import {getBook} from '~/utils/reader'
import iddb from '~/storage/iddb'
import {toArrayBuffer} from '~/utils/fileReader'
import BookCard from './BookCard'
import Storage from '~/storage/localStorage'

export default function Manager() {
  const [books, setBooks] = useState<any[]>([])
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
    await Promise.all([...e.target.files].map(async file => {
      const book: any = await getBook(file)
      const cover = await book.getCover()
      const data = await toArrayBuffer(file)
      const createTime = Date.now()
      await iddb.addBook(data, {createTime, cover, name: file.name, type: file.type, ...book.metadata})
    }))
    loadBooks()
  }, [])

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
