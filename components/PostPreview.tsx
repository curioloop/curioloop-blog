import React from 'react'
import LocaleDate from './LocaleDate'
import { useLocale } from 'next-intl'
import { BlogMeta } from '@/blogs/post'
import Image from 'next/image'


type Props = {
  posts: BlogMeta[]
}

const PostPreview = ({ posts }: Props) => {
  const locale = useLocale()
  const renderPreview = ({slug, date, cover, title, summary}:BlogMeta) => (
    <div key={`${slug}`} className="mt-6 overflow-auto rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
      {
        cover &&
        <a className="contents" href={`/${locale}/posts/${slug}`}>
          <div className="relative md:pt-[35%] rounded-t-md">
          <Image fill className="block absolute inset-0 h-full w-full object-cover" alt={title} src={cover}/>
          </div>
        </a>
      }
      <article className="p-6">
        <h2 className="mb-4">
          <a className="text-2xl" href={`/${locale}/posts/${slug}`}>{title}</a>
        </h2>
        <section className="mb-4 line-clamp-3">{summary}</section>
        <div className="flex justify-between">
          <LocaleDate className="font-light" date={date}/>
          <a className="h-6 w-6 pt-1 cursor-pointer hover:text-light-hov dark:hover:text-dark-hov">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"> 
              <polyline points="13 17 18 12 13 7" />  
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </a>
        </div>
      </article>
    </div>
  )

  return (
    <>{posts.map((meta) => renderPreview(meta))}</>
  )
}

export default PostPreview