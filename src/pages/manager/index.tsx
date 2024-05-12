import './index.less'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Input} from 'antd'
import {PlusOutlined, SearchOutlined} from '@ant-design/icons'
import {getBook} from '~/utils/reader'
import bookDataSt from '~/storage/iddb/BookDataSt'
import bookInfoSt from '~/storage/iddb/BookInfoSt'
import {toArrayBuffer} from '~/utils/fileReader'
import BookCard from './BookCard'

export default function Manager() {
  const [books, setBooks] = useState<any[]>([])
  const refFileInput = useRef<HTMLInputElement>(null)

  const loadBooks = async () => {
    const books = await bookInfoSt.getAll()
    setBooks(books)
  }

  const handleClickImport = useCallback(() => {
    refFileInput.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0]
    const book: any = await getBook(file)
    const cover = await book.getCover()
    const data = await toArrayBuffer(file)
    const id = await bookDataSt.add(data)
    const info = {id, cover, ...book.metadata}
    bookInfoSt.add(info)
    loadBooks()
  }, [])

  useEffect(() => {
    loadBooks()
  }, [])

  return (
    <div className="manager">
      <div className="manager-header">
        <input ref={refFileInput} className="file-input" type="file" onChange={handleFileChange}/>
        <Input className="search-input"
          prefix={<SearchOutlined/>}
          suffix={<PlusOutlined className="import-btn" onClick={handleClickImport}/>}
        />
      </div>
      <div className="manager-books-wrapper">
        <div className="manager-books">
          {books.map((book) => (<BookCard key={book.id} info={book}/>))}
        </div>
      </div>
    </div>
  )
}
