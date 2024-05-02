
import React from 'react'

import { getPostTags } from '@/blogs/post'
import { useLocale } from 'next-intl'


type Tag = {
  id: string,
  value: string
  count: number
}

const TagCloud = async () => {

  const locale = useLocale()

  const tags = (await getPostTags(locale)).map(
    ({id, tag:value, posts:{length:count}}) => ({id, value, count} satisfies Tag)
  )

  const maxSize = 2.2, minSize = 1
  const fontSizeConverter = (count:number, min:number, max:number) => {
    const fontSize = (max - min === 0) ? Math.round((minSize + maxSize) / 2) : 
                                         Math.round(((count - min) * (maxSize - minSize)) / (max - min) + minSize)
    return `${fontSize}rem`
  }

  const renderTags = () => {
    const counts = tags.map(tag => tag.count),
        min = Math.min(...counts),
        max = Math.max(...counts)
    return tags.map(({id, value, count}) => {
      const fontSize = fontSizeConverter(count, min, max)
      return <li key={value} className="flex items-center my-2 mx-5">
               <a className="decoration-clone transform transition duration-300 hover:scale-110 hover:drop-shadow-2xl" 
                  href={`/${locale}/tags/${id}`} style={{fontSize}}>{value}</a>
             </li>
    })
  }

  return (
      <div className="mt-6 p-6 overflow-auto min-h-[35rem] rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
        <ul className="flex flex-wrap justify-center w-full align-center gap-2 leading-8">
          {renderTags()}
        </ul>
      </div>
  )
}

export default TagCloud