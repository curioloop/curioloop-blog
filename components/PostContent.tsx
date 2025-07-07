'use client'

import React, { ReactNode, useEffect, useRef } from 'react'

const PostContent = ({ children } : { children?: ReactNode }) => {

  const root = useRef(null)
  const scroll = useRef(0)
  const observer = useRef<IntersectionObserver>(undefined)

  useEffect(() => {
    if (!root.current) return
    const div = root.current as HTMLDivElement
    const headings = Array.from(div.querySelectorAll("h1, h2, h3, h4, h5, h6")) as HTMLElement[]

    const ids = headings.map((e) => e.id)
    const callback:IntersectionObserverCallback = (entries) => {
      const interesed:string[] = []
      entries.forEach((entry) => {
        const id = entry.target.id
        if (entry.isIntersecting) {
          scroll.current = window.scrollY
          interesed.push(id)
        } else {
          const previous = ids[ids.indexOf(id) - 1]
          const scrollUp = (scroll.current - window.scrollY) > 0
          if (scrollUp) {
            interesed.push(previous)
          }
        }
      })
      if (interesed.length) {
        document.dispatchEvent(new CustomEvent('TOC-HIGHLIGHT', {detail: interesed[0]}))
      }
    }
  
    observer.current = new IntersectionObserver(callback, {
      rootMargin: "0% 0% -85% 0%",
      threshold: 0.2,
    })
    headings.forEach(head => observer.current?.observe(head))
    return () => observer.current?.disconnect()
  }, [])

  return <div ref={root}>{children}</div> 
}

export default PostContent