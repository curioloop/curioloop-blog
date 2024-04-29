'use client';

import React, { useEffect, useState, JSX, ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { SearchResult, searchDocs, useSearchDocs } from '@/blogs/search'

const SearchEngine = ({ children } : { children?: ReactNode }) => {

  const locale = useLocale()
  const { docs, isLoading, error } = useSearchDocs()
  const [term, setTerm] = useState('')
  const [result, setResult] = useState<SearchResult[]|null>()

  useEffect(() => {
    if (!error && docs) {
      setResult(searchDocs(docs, term))
    }
  }, [term, docs, error])

  const highlightText = (text:string, indices?:[number,number][], trimStart:boolean=false) => {
    if (!indices) return text

    if (trimStart && text.length > 50) {
      const [start] = indices[0]
      if (start > 50) {
        const offset = start - 10
        text = text.slice(offset, text.length)
        indices = indices.map(([start, end]) => [start-offset, end-offset])
      }
    }

    let cursor:number[] = [0, 0]
    const highlited:JSX.Element[] = []
    for (const i in indices) {
      const [start, end] = indices[i]
      highlited.push(<>{text.slice(cursor[1], start)}</>)
      highlited.push(<mark key={i}>{text.slice(start, end)}</mark>)
      cursor = indices[i]
    }
    if (cursor[1] < text.length) {
      highlited.push(<>{text.slice(cursor[1], text.length)}</>)
    }
    return highlited
  }

  const renderResult = ({document: {slug, title, content}, indices}:SearchResult) => {
    const titleElem = highlightText(title, indices.title)
    const contentElem = highlightText(content, indices.content, true)
    return (
      <div key={slug} className="mt-6 overflow-auto rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
        <article className="p-6">
          <h2 className="mb-4">
            <a className="text-2xl" href={`/${locale}/posts/${slug}`}>{titleElem}</a>
          </h2>
          <section className="mb-4 line-clamp-3">{contentElem}</section>
        </article>
      </div>)
    }

  const t = useTranslations('Default')
  
  return (
    <>
      <div className="mt-6 p-6 overflow-auto rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
        <form>   
          <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                { isLoading || error ? 
                  <svg className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg> :
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                }
              </div>
              <input placeholder={t('search-hint')} onChange={e => setTerm(e.target.value)} type="search" className="block w-full p-4 ps-10 text-sm rounded-md outline-0	
                    text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400 
                    border border-gray-300 dark:border-gray-600 focus:border-light-hov dark:focus:border-dark-hov" />
          </div>
        </form>
      </div>
      {
        result ? result.map((result) => renderResult(result)) : children ? children : <></>
      }
    </>
  )
}

export default SearchEngine