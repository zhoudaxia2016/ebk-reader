import './index.less'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button, Input, notification} from 'antd'
import {PlusOutlined, SearchOutlined} from '@ant-design/icons'
import iddb from '~/storage/iddb'
import BookCard from './BookCard'
import Storage from '~/storage/localStorage'
import MoreMenu from './MoreMenu'
import {saveBooks} from './utils'
import {useNavigate} from 'react-router-dom'
import ProgressModal from '~/components/ProgressModal'

function Manager() {
  const [books, setBooks] = useState<any[]>([])
  const [notice, contextHolder] = notification.useNotification()
  const [selectedBooks, setSelectBooks] = useState({})
  const refFileInput = useRef<HTMLInputElement>(null)
  const refBookUserInfo = useRef<any>()
  const refMd5Set = useRef(new Set<string>())
  const navigate = useNavigate()
  const refProgress = useRef<ProgressModal>()

  const loadBooks = async () => {
    const books = (await iddb.getAllBookInfo()).map(_ => _[1])
    books.sort((a, b) => {
      const atime = refBookUserInfo.current.get(a.id)?.accessTime || a.createTime
      const btime = refBookUserInfo.current.get(b.id)?.accessTime || b.createTime
      return btime - atime
    })
    setBooks(books)
    refMd5Set.current = new Set(books.map(_ => _.md5))
  }

  const handleClickImport = useCallback(() => {
    refFileInput.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e) => {
    refProgress.current.open()
    const {failFiles} = await saveBooks({files: [...e.target.files], md5Set: refMd5Set.current, onProgress: (p) => refProgress.current.updatePercent(p)})
    refProgress.current.close()
    const bookNum = e.target.files.length
    const failNum = failFiles.length
    if (failFiles.length > 0) {
      notice.warning({
        message: `成功导入${bookNum - failNum}本，导入失败书籍(${failNum}本)：`,
        description: failFiles.map((_, i) => <div key={i}>{_.name}</div>),
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

  const handleRestoreComplete = useCallback(() => {
    loadBooks()
  }, [loadBooks])

  const getMd5Set = useCallback(() => {
    return refMd5Set.current
  }, [])

  const getBookUserInfo = useCallback(() => {
    return refBookUserInfo.current
  }, [])

  const handleSelect = useCallback((id, selected) => {
    selectedBooks[id] = selected
    setSelectBooks({...selectedBooks})
  }, [selectedBooks])

  const showOperation = Object.values(selectedBooks).some(_ => _)
  const handleClickBook = useCallback((id, selected) => {
    if (showOperation) {
      handleSelect(id, !selected)
      return
    }
    navigate('/book?id=' + id)
  }, [showOperation, handleSelect])

  const handleHeaderClick = useCallback(() => {
    setSelectBooks({})
  }, [])

  const handleBatchDelete = () => {
    Object.keys(selectedBooks).forEach(id => handleDelete(Number(id)))
    setSelectBooks({})
  }

  return (
    <div className="manager">
      {contextHolder}
      <ProgressModal ref={refProgress} title="正在导入..."/>
      <div className="manager-header" onClick={handleHeaderClick}>
        <input ref={refFileInput} className="file-input" multiple type="file" accept=".epub,.mobi,.azw3,fb2,cbz" onChange={handleFileChange}/>
        <Input className="search-input"
          prefix={<SearchOutlined/>}
          addonAfter={<MoreMenu onRestoreComplete={handleRestoreComplete} getMd5Set={getMd5Set} getBookUserInfo={getBookUserInfo}/>}
          suffix={<PlusOutlined className="import-btn" onClick={handleClickImport}/>}
        />
      </div>
      <div className="manager-books-wrapper">
        {
          showOperation &&
          <div className="manager-operations">
            <Button type="text" onClick={handleBatchDelete}>删除</Button>
          </div>
        }
        <div className="manager-books">
          {books.map((book) => (
            <BookCard key={book.id} selected={selectedBooks[book.id]} info={book}
              onDelete={handleDelete} onSelect={handleSelect} onClick={handleClickBook}
              />
          ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Manager)
