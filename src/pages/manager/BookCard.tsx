import React, {useCallback, useEffect, useState} from 'react'
import {toDataURL} from '~/utils/fileReader'
import {useNavigate} from 'react-router-dom'
import {Button, Dropdown} from 'antd'
import iddb from '~/storage/iddb'

export default function BookCard({info: {author, title, cover, id}, onDelete}) {
  const [coverSrc, setCoverSrc] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    toDataURL(cover).then((src: any) => {
      setCoverSrc(src)
    })
  }, [cover])

  const handleDelete = useCallback(async () => {
    onDelete(id)
  }, [id])

  const items = [
    {label: <Button type="text" onClick={handleDelete}>删除</Button>, key: 1},
  ]

  const handleClick = useCallback(() => {
    navigate('/book?id=' + id)
  }, [id])

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      <div className="book-card" onClick={handleClick}>
        <div className="book-cover">
          {coverSrc && <img src={coverSrc}/> }
        </div>
        <div className="book-info">
          <div className="book-title">{title}</div>
          <div className="book-author">{author[0].name}</div>
        </div>
      </div>
    </Dropdown>
  )
}
