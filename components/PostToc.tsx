'use client'

import React, { ReactNode, useEffect, useRef } from 'react'

const PostToc = ({ children, className } : { children?: ReactNode, className:string }) => {

  const root = useRef(null)

  useEffect(() => {

    const listener = (event:Event) => {
      if (!root.current) return
      const elems = (root.current as HTMLElement).querySelectorAll("a")
      const {detail:id} = event as CustomEvent
      elems.forEach((elem:HTMLAnchorElement) => {
        const href = elem.attributes.getNamedItem('href')?.value
        const highlight = href == `#${id}`
        const highligtCls = className.split(' ')
        highligtCls.forEach(c => highlight ? elem.classList.add(c) : elem.classList.remove(c))
      })
    }

    if (root.current) {
      document.addEventListener('TOC-HIGHLIGHT', listener)
      return () => document.removeEventListener('TOC-HIGHLIGHT', listener)
    }
  }, [className])

  return (
    <ul ref={root}>{children}</ul> 
  )
}

export default PostToc