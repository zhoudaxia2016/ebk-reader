import React, {useCallback, useEffect, useState} from 'react'
import {toDataURL} from '~/utils/fileReader'
import {Button, Dropdown, Modal} from 'antd'
import formatDate from '~/utils/formatDate'
import {CheckCircleFilled} from '@ant-design/icons'
import ShelfForm from './ShelfForm'

interface IProps {
  info: any,
  onDelete: (id) => void,
  onSelect: (id, selected: boolean) => void,
  selected: boolean,
  onClick: (id, selected: boolean) => void,
  onSelectAll: () => void,
  shelfs: any[],
  onPutShelf: (any) => void,
}

export default function BookCard({info: {author, title, cover, id, published = '', publisher, createTime, description, type, language = []}, onDelete, onSelect, selected, onClick, onSelectAll, shelfs, onPutShelf}: IProps) {
  const [modal, contextHolder] = Modal.useModal()
  const [coverSrc, setCoverSrc] = useState('')

  useEffect(() => {
    if (!cover) {
      return
    }
    toDataURL(cover).then((src: any) => {
      setCoverSrc(src)
    })
  }, [cover])

  const handleDelete = useCallback(async () => {
    onDelete(id)
  }, [id])

  const handleDetail = useCallback(async () => {
    modal.info({
      title,
      footer: null,
      content: (
        <div className="book-detail">
          <div>{author.map(_ => _.name || _).join(' ')}</div>
          <div>创建时间：{formatDate(createTime)}</div>
          <div>文件类型：{type}</div>
          <div>语言：{Array.isArray(language) ? language.join(' ') : language}</div>
          <div>{description}</div>
          <div>{published.split(/T|\s/)[0]} {publisher}</div>
        </div>
      ),
      maskClosable: true,
    })
  }, [id, modal, title, published, publisher, createTime, description, type, language])

  const handleSelect = useCallback(() => {
    onSelect(id, !selected)
  }, [id, selected, onSelect])

  const handleSelectAll = useCallback(() => {
    onSelectAll()
  }, [onSelectAll])

  const items = [
    {label: <Button type="text" onClick={handleDelete}>删除</Button>, key: 1},
    {label: <Button type="text" onClick={handleDetail}>详情</Button>, key: 2},
    {label: <Button type="text" onClick={handleSelect}>选择</Button>, key: 3},
    {label: <Button type="text" onClick={handleSelectAll}>全选</Button>, key: 4},
    {label: <ShelfForm bookId={id} shelfs={shelfs} onFinish={onPutShelf}/>, key: 5},
  ]

  const handleClick = useCallback(() => {
    onClick(id, selected)
  }, [id, selected, onClick])

  return (
    <>
      {contextHolder}
      <Dropdown menu={{ items }} trigger={['contextMenu']}>
        <div className="book-card" onClick={handleClick}>
          <div className="book-cover">
            {coverSrc && <img src={coverSrc}/> }
          </div>
          <div className="book-info">
            <div className="book-title">{title}</div>
            <div className="book-author">{author?.[0].name}</div>
          </div>
          {selected && <CheckCircleFilled className="check-btn"/>}
        </div>
      </Dropdown>
    </>
  )
}
