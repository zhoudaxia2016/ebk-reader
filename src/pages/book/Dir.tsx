import React, {useCallback, useMemo, useState} from 'react'
import {UnorderedListOutlined} from '@ant-design/icons'
import {Button, Collapse, Drawer} from 'antd'

export default function Dir({toc, goto, title}) {
  const [open, setOpen] = useState(false)
  const handleClick = (href) => {
    goto(href)
    setOpen(false)
  }
  const items = useMemo(() => {
    if (!toc) {
      return null
    }
    return toc.map(s => ({
      label: <div className="dir-chapter" onClick={() => handleClick(s.href)}>{s.label}</div>,
      key: s.id,
      showArrow: !!s.subitems,
      children: s.subitems
        ? s.subitems.map(item => (<div className="dir-section" key={item.id} onClick={() => handleClick(item.href)}>{item.label}</div>))
        : null
    }))
  }, [toc])
  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])
  return (
    <>
      <Button className="dir-btn" type="text" size="large" icon={<UnorderedListOutlined/>} onClick={handleOpen}></Button>
      <Drawer rootClassName="dir-container" title={title} open={open} placement="bottom" height="auto" closeIcon={null} onClose={handleClose}>
        <Collapse bordered={false} items={items} collapsible="icon"/>
      </Drawer>
    </>
  )
}
