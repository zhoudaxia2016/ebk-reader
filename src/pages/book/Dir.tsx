import React, {useCallback, useEffect, useMemo, useRef, useState, Fragment} from 'react'
import {UnorderedListOutlined} from '@ant-design/icons'
import {Button, Collapse, Drawer} from 'antd'

function DirItem({children, info: {href, id}, activeId, onClick, className = ''}) {
  let cs = 'dir-item'
  if (className) {
    cs += (' ' + className)
  }
  const isActive = () => {
    return activeId?.has(id)
  }
  if (isActive()) {
    cs += ' active'
  }
  const handleClick = useCallback(() => {
    onClick(href)
  }, [href, onClick])

  const refRoot = useRef<HTMLDivElement>()
  useEffect(() => {
    if (isActive()) {
      refRoot.current.scrollIntoView()
    }
  }, [id, activeId])

  return <div ref={refRoot} className={cs} onClick={handleClick}>{children}</div>
}

export default function Dir({toc, goto, title, getCurrentChapter}) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<Set<string>>()
  const [expandId, setExpandId] = useState<string>()
  const handleClick = (href) => {
    goto(href)
    setOpen(false)
  }

  const items = useMemo(() => {
    if (!toc) {
      return null
    }
    return toc.map(s => ({
      label: <DirItem className="dir-chapter" info={s} activeId={activeId} onClick={handleClick}>{s.label}</DirItem>,
      key: s.id,
      showArrow: !!s.subitems,
      children: s.subitems
        ? s.subitems.map(item => (
          <Fragment key={item.id}>
            <DirItem className="dir-section" key={item.id} info={item} activeId={activeId} onClick={handleClick}>
              {item.label}
            </DirItem>
            {
              item.subitems &&
              <div>{item.subitems.map(_ => <DirItem key={_.id} className="dir-section-subitem" activeId={activeId} info={_} onClick={handleClick}>{_.label}</DirItem>)}</div>
            }
          </Fragment>
        ))
        : null
    }))
  }, [toc, activeId])

  const handleOpen = useCallback(() => {
    setOpen(true)
    let c = getCurrentChapter()
    const activeId = new Set<string>()
    let expandId
    while(c) {
      activeId.add(c.id)
      if (c.subitems) {
        expandId = c.id
      }
      c = c.parent
    }
    setExpandId(expandId)
    setActiveId(activeId)
  }, [])
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <Button className="dir-btn" type="text" size="large" icon={<UnorderedListOutlined/>} onClick={handleOpen}></Button>
      <Drawer rootClassName="dir-container" destroyOnClose title={title} open={open} placement="bottom" height="auto" closeIcon={null} onClose={handleClose}>
        <Collapse bordered={false} items={items} collapsible="icon" defaultActiveKey={expandId}/>
      </Drawer>
    </>
  )
}
