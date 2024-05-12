import './index.less'
import React, {useCallback, useEffect, useRef} from 'react'
import {useSearchParams} from 'react-router-dom'
import bookDataSt from '~/storage/iddb/BookDataSt'
import bookInfoSt from '~/storage/iddb/BookInfoSt'
import {getBook, mountBook} from '~/utils/reader'
import {LeftOutlined, RightOutlined} from '@ant-design/icons'
import {Button} from 'antd'

export default function Book() {
  const [searchParams] = useSearchParams()
  const refReader = useRef<HTMLDivElement>(null)
  const refBook = useRef<any>(null)
  const refView = useRef<any>(null)

  useEffect(() => {
    const loadBook = async () => {
      if (!refReader.current) {
        return
      }
      const id = Number(searchParams.get('id'))
      const data = await bookDataSt.get(id)
      const info = await bookInfoSt.get(id)
      const blob = new File([data], info.name, {type: info.type})
      const book = await getBook(blob)
      refReader.current.innerText = ''
      refBook.current = book
      const view = await mountBook(book, refReader.current)
      refView.current = view
    }
    loadBook()
    return () => {
      refBook.current?.destroy()
      refView.current?.renderer.destroy()
      if (refView.current) {
        refReader.current?.removeChild(refView.current)
      }
    }
  }, [])

  const prev = useCallback(() => {
    refView.current.prev()
  }, [])
  const next = useCallback(() => {
    refView.current.next()
  }, [])

  return (
    <div className="reader-wrapper">
      <div className="reader" ref={refReader}></div>
      <div className="footer">
        <Button className="prev" icon={<LeftOutlined/>} onClick={prev}></Button>
        <Button className="next" icon={<RightOutlined/>} onClick={next}></Button>
      </div>
    </div>
  )
}
