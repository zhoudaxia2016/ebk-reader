import './index.less'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Input, notification, Dropdown, Button} from 'antd'
import {PlusOutlined, SearchOutlined, VerticalAlignBottomOutlined, EllipsisOutlined} from '@ant-design/icons'
import {getBook} from '~/utils/reader'
import iddb from '~/storage/iddb'
import {toArrayBuffer} from '~/utils/fileReader'
import BookCard from './BookCard'
import Storage from '~/storage/localStorage'
import CryptoJS from 'crypto-js'
import JSZip, {loadAsync} from 'jszip'
import {saveAs} from 'file-saver'

const backupBookFolder = 'books'
const backupZip = 'ebk_backup.zip'
const backupConfig = 'config.json'

function getMd5(data) {
  const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(data))
  return hash.toString(CryptoJS.enc.Hex)
}

function parseFileName(name) {
  const match = /(.*)\.(\w+)$/.exec(name)
  if (match) {
    return {name: match[1], ext: match[2]}
  }
  return {}
}

export default function Manager() {
  const [books, setBooks] = useState<any[]>([])
  const [notice, contextHolder] = notification.useNotification()
  const refFileInput = useRef<HTMLInputElement>(null)
  const refBookUserInfo = useRef<any>()
  const refMd5Set = useRef(new Set())

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

  const saveBooks = async (files, md5Set, isBuffer = false) => {
    const result = await Promise.all(files.map(async file => {
      let data
      if (isBuffer) {
        data = file.data
        const {ext = ''} = parseFileName(file.name)
        file = new File([file.data], file.name, {type: `application/${ext}`})
      } else {
        data = await toArrayBuffer(file)
      }
      const book: any = await getBook(file)
      const md5 = getMd5(data)
      if (md5Set.has(md5)) {
        return {name: file.name, isSuccess: false}
      }
      const cover = await book.getCover()
      const createTime = Date.now()
      const id = await iddb.addBook(data, {createTime, cover, name: file.name, type: file.type, md5, ...book.metadata})
      return {name: file.name, id, isSuccess: true}
    }))
    const successFiles = result.filter(_ => _.isSuccess)
    const failFiles = result.filter(_ => !_.isSuccess)
    return {successFiles, failFiles}
  }

  const handleClickImport = useCallback(() => {
    refFileInput.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e) => {
    const {failFiles} = await saveBooks([...e.target.files], refMd5Set.current)
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

  const handleBackup = useCallback(async () => {
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
    const config = refBookUserInfo.current.getAll()
    zip.file(backupConfig, JSON.stringify(config))
    zip.generateAsync({type: 'blob'}).then(function(content) {
      saveAs(content, backupZip)
    })
  }, [])

  const refRestoreInput = useRef(null)
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
    const {successFiles, failFiles} = await saveBooks(files, refMd5Set.current, true)
    successFiles.forEach((file) => {
      const {name = ''} = parseFileName(file.name)
      if (!name) {
        return
      }
      refBookUserInfo.current.set(file.id, config[name])
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
    loadBooks()
  }, [])

  const handleRestore = useCallback(() => {
    refRestoreInput.current?.click()
  }, [])

  const menuItems = [
    {label: <Button type="text" onClick={handleBackup}>备份</Button>, key: 1},
    {label: <Button type="text" onClick={handleRestore}>导入</Button>, key: 2},
  ]

  const moreMenu = (
    <Dropdown menu={{items: menuItems}}>
      <EllipsisOutlined/>
    </Dropdown>
  )

  return (
    <div className="manager">
      {contextHolder}
      <div className="manager-header">
        <input ref={refFileInput} className="file-input" multiple type="file" accept=".epub,.mobi,.azw3,fb2,cbz" onChange={handleFileChange}/>
        <input ref={refRestoreInput} className="file-input" type="file" accept=".zip" onChange={handleRestoreInputChange}/>
        <Input className="search-input"
          prefix={<SearchOutlined/>}
          addonAfter={moreMenu}
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
