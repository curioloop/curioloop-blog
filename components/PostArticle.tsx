import { BlogPost } from '@/blogs/post'
import React from 'react'
import LocaleDate from './LocaleDate'
import PostRender from './PostRender'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import PostDiscussion from '@/components/PostDiscussion'


type Props = {
  post: BlogPost
}

const PostArticle = async ({ post }:Props) => {
  const locale = useLocale()
  const {meta : {title, cover, tags, date } } = post
  const tagList = Object.entries(tags)
  return (
      <article className="mt-6 overflow-auto rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
        {
          cover &&
          <div className="relative block md:pt-[35%] rounded-t-lg">
            <Image fill className="block absolute inset-0 h-full w-full object-cover" alt={title} src={cover}/>
          </div>
        }
        <header className="block px-6 pt-6 pb-0">
          <h1 className="text-2xl mb-4 break-words">{title}</h1>
          <LocaleDate className="font-light" date={date}/>
        </header>
        <PostRender post={post}/>
        <footer className="flex flex-wrap justify-start gap-2 p-6 mt-4 pt-4 border-t dark:border-dark-bg-lite">
          <PostDiscussion locale={locale} />
          {
            tagList.map(([id, tag]) => (
              <a className="px-3 rounded-md border border-light-lite text-light-lite hover:text-light-lite-hov hover:bg-light-lite dark:hover:bg-dark-bg-lite " 
                 key={id} href={`/${locale}/tags/${id}`}>{tag}</a>
            ))
          }
        </footer>
      </article>
  )
}

export default PostArticle