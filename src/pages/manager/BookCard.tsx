import React, {useCallback, useEffect, useState} from 'react'
import {toDataURL} from '~/utils/fileReader'
import {useNavigate} from 'react-router-dom'

export default function BookCard({info: {author, title, cover, id}}) {
  const [coverSrc, setCoverSrc] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    toDataURL(cover).then((src: any) => {
      setCoverSrc(src)
    })
  }, [cover])

  const handleClick = useCallback(() => {
    navigate('/book?id=' + id)
  }, [id])

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-cover">
        {coverSrc && <img src={coverSrc}/> }
      </div>
      <div className="book-info">
        <div className="book-title">{title}</div>
        <div className="book-author">{author[0].name}</div>
      </div>
    </div>
  )
}
