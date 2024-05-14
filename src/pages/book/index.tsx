import './index.less'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import iddb from '~/storage/iddb'
import {getBook, mountBook} from '~/utils/reader'
import {LeftOutlined, RightOutlined} from '@ant-design/icons'
import {Button} from 'antd'
import {EPUB} from '~/foliate-js/epub'
import Dir from './Dir'

const RECORD_LOCATION_KEY = 'ebk_recordLocation'
const recordLocationJSON = localStorage.getItem(RECORD_LOCATION_KEY)
const recordLocation: Record<string, number> = recordLocationJSON ? JSON.parse(recordLocationJSON) : {}

export default function Book() {
  const [searchParams] = useSearchParams()
  const [sections, setSections] = useState<EPUB['sections']>([])
  const [sectionIndex, setSectionIndex] = useState(0)
  const refReader = useRef<HTMLDivElement>(null)
  const refBook = useRef<any>(null)
  const refView = useRef<any>(null)
  const refId = useRef<number>()
  const [toc, setToc] = useState([])

  const handleRelocate = useCallback((e) => {
    const {section: {current}, fraction} = e.detail
    setSectionIndex(current)
    recordLocation[refId.current] = fraction
    localStorage.setItem(RECORD_LOCATION_KEY, JSON.stringify(recordLocation))
  }, [sectionIndex])

  useEffect(() => {
    const loadBook = async () => {
      if (!refReader.current) {
        return
      }
      const id = Number(searchParams.get('id'))
      refId.current = id
      const fraction = recordLocation?.[id] || 0
      const data = await iddb.getBookData(id)
      const info = await iddb.getBookInfo(id)
      const blob = new File([data], info.name, {type: info.type})
      const book: any = await getBook(blob)
      refReader.current.innerText = ''
      refBook.current = book
      const view: any = await mountBook(book, refReader.current)
      refView.current = view
      setSections(book.sections)
      setToc(book.toc)
      view.addEventListener('relocate', handleRelocate)
      view.goToFraction(fraction)
    }
    loadBook()
    return () => {
      refBook.current?.destroy()
      refView.current?.renderer.destroy()
      refView.current?.removeEventListener('relocate', handleRelocate)
      if (refView.current) {
        refReader.current?.removeChild(refView.current)
      }
    }
  }, [])

  const prev = useCallback(() => {
    refView.current.renderer.prevSection()
  }, [])
  const next = useCallback(() => {
    refView.current.renderer.nextSection()
  }, [])
  const goto = useCallback((href) => {
    refView.current.goTo(href)
  }, [])

  return (
    <div className="reader-wrapper">
      <div className="reader" ref={refReader}></div>
      <div className="footer">
        <Button className="prev" icon={<LeftOutlined/>} disabled={sectionIndex === 0} onClick={prev}></Button>
        <Dir toc={toc} goto={goto}/>
        <Button className="next" icon={<RightOutlined/>} disabled={sectionIndex === sections.length - 1} onClick={next}></Button>
      </div>
    </div>
  )
}
