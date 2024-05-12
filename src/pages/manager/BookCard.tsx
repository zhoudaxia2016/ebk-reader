import React, {useEffect, useState} from 'react'
import {toDataURL} from '~/utils/fileReader'

export default function BookCard({info: {author, title, cover}}) {
  const [coverSrc, setCoverSrc] = useState('')
  useEffect(() => {
    toDataURL(cover).then((src: any) => {
      setCoverSrc(src)
    })
  }, [cover])
  return (
    <div className="book-card">
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
