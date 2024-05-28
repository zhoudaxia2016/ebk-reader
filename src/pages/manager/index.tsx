import './index.less'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Button, Input, notification, Segmented, Dropdown} from 'antd'
import {PlusOutlined, SearchOutlined, EllipsisOutlined} from '@ant-design/icons'
import iddb from '~/storage/iddb'
import BookCard from './BookCard'
import {shelfStorage, bookUserInfoStorage} from '~/storage/localStorage'
import MoreMenu from './MoreMenu'
import {saveBooks} from './utils'
import {useNavigate} from 'react-router-dom'
import ProgressModal from '~/components/ProgressModal'

function Manager() {
  const [books, setBooks] = useState<any[]>([])
  const [notice, contextHolder] = notification.useNotification()
  const [selectedBooks, setSelectBooks] = useState<Record<string, any>>({})
  const refFileInput = useRef<HTMLInputElement>(null)
  const refMd5Set = useRef(new Set<string>())
  const navigate = useNavigate()
  const refProgress = useRef<ProgressModal>()
  const [searchVal, setSearchVal] = useState('')
  const [isComp, setIsComp] = useState(false)
  const [shelfs, setShelfs] = useState(shelfStorage.getAll())
  const [shelf, setShelf] = useState('')

  const loadBooks = async () => {
    const books = (await iddb.getAllBookInfo()).map(_ => _[1])
    books.sort((a, b) => {
      const atime = bookUserInfoStorage.get(a.id)?.accessTime || a.createTime
      const btime = bookUserInfoStorage.get(b.id)?.accessTime || b.createTime
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

  const handlePutShelf = useCallback(({shelfId, bookId, newShelf}) => {
    if (!shelfId) {
      shelfId = Date.now()
      newShelf = {name: newShelf, id: shelfId}
      shelfs.push(newShelf)
      shelfStorage.set(shelfId, newShelf)
    }
    bookUserInfoStorage.set(bookId, {shelf: shelfId})
    setShelfs(shelfStorage.getAll())
    setShelf(shelfId)
  }, [])

  const handleBatchDelete = () => {
    Object.keys(selectedBooks).forEach(id => selectedBooks[id] && handleDelete(Number(id)))
    setSelectBooks({})
  }

  const handleSearch = useCallback((e) => {
    if (isComp) {
      return
    }
    setSearchVal(e.target.value)
  }, [isComp])

  const handleCompositionStart = useCallback((e) => {
    setIsComp(true)
  }, [])

  const handleCompositionEnd = useCallback((e) => {
    setIsComp(false)
    setSearchVal(e.target.value)
  }, [])

  const filterBooks = useMemo(() => {
    let result = books
    if (searchVal) {
      result = result.filter(b => b.name.includes(searchVal))
    }
    if (shelf) {
      result = result.filter(b => {
        const userInfo = bookUserInfoStorage.get(b.id)
        if (!userInfo) {
          return false
        }
        return userInfo.shelf === shelf
      })
    }
    return result
  }, [books, searchVal, shelf])

  const handleSelectAll = useCallback(() => {
    books.forEach(b => selectedBooks[b.id] = true)
    setSelectBooks({...selectedBooks})
  }, [books, selectedBooks])

  const handleShelfChange = useCallback((val) => {
    setShelf(val)
  }, [])

  const handleDeleteShelf = () => {
    shelfStorage.delete(shelf)
    setShelf('')
    setShelfs(shelfStorage.getAll())
  }

  const groups = [
    {label: '全部', value: ''},
    ...shelfs.map(_ => ({label: _.name, value: _.id}))
  ]

  const shelfMenus = [
    {label: <Button type="text" disabled={!shelf} onClick={handleDeleteShelf}>删除书架</Button>, key: 0}
  ]

  return (
    <div className="manager">
      {contextHolder}
      <ProgressModal ref={refProgress} title="正在导入..."/>
      <div className="manager-header" onClick={handleHeaderClick}>
        <input ref={refFileInput} className="file-input" multiple type="file" accept=".epub,.mobi,.azw3,fb2,cbz" onChange={handleFileChange}/>
        <Input className="search-input"
          prefix={<SearchOutlined/>} onChange={handleSearch} onCompositionEnd={handleCompositionEnd} onCompositionStart={handleCompositionStart}
          addonAfter={<MoreMenu onRestoreComplete={handleRestoreComplete} getMd5Set={getMd5Set}/>}
          suffix={<PlusOutlined className="import-btn" onClick={handleClickImport}/>}
        />
        <Segmented className="manager-shelfs" options={groups} onChange={handleShelfChange} value={shelf}/>
      </div>
      <div className="manager-books-wrapper">
        {
          showOperation &&
          <div className="manager-operations">
            <Button type="text" onClick={handleBatchDelete}>删除</Button>
          </div>
        }
        <div className="manager-books">
          {filterBooks.map((book) => (
            <BookCard key={book.id} selected={selectedBooks[book.id]} info={book}
              onDelete={handleDelete} onSelect={handleSelect} onClick={handleClickBook} onSelectAll={handleSelectAll}
              shelfs={shelfs} onPutShelf={handlePutShelf}
            />
          ))}
        </div>
      </div>
      <Dropdown className="shelf-menus" menu={{items: shelfMenus}} trigger={['click']}>
        <Button><EllipsisOutlined/></Button>
      </Dropdown>
    </div>
  )
}

export default React.memo(Manager)
