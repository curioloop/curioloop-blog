import React from 'react'
import { getLocale } from 'next-intl/server'
import LocaleDate from './LocaleDate'
import { getPostTimeline } from '@/blogs/post'

const Timeline = async () => {

  const locale = await getLocale()
  const timeline = await getPostTimeline(locale)
  const months = Object.keys(timeline).sort().toReversed()

  const renderMonth = (month:string, month_idx:number) => {
    return timeline[month].map(({title, summary, slug}, index) => (
      <li key={slug} className="mb-4 ms-4">
        {
          index == 0 && <div className={month_idx > 0 ? "mt-14": ""}>
            <span className="absolute w-3 h-3 rounded-full -start-1.5 bg-light-lite shadow-[2px_2px_8px_1px_rgba(156,163,175,0.2)]"></span>
            <LocaleDate className="flex mb-1 text-sm font-normal leading-none text-light-lite" month={month}/>
          </div>
        }
        <h3 className="pl-3 pt-4 text-lg font-semibold text-light-txt dark:text-dark-txt">
            <a className="inline-block decoration-clone transform transition duration-300 hover:scale-105 hover:drop-shadow-xl" 
              href={`/${locale}/posts/${slug}`}>{title}</a>
        </h3>
        {
          summary?.length > 0 && 
          <p className="pl-3 text-base font-normal text-light-lite line-clamp-3">{summary}</p>
        }
      </li>
    ))
  }

  return (
    <div className="mt-6 p-6 mx-10 xl:p-16 xl:-mx-20 2xl:-mx-10 overflow-auto min-h-[35rem] rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
      <ol className="relative border-s border-light-lite shadow-[inset_12px_0px_10px_-10px_rgba(156,163,175,0.2)] dark:shadow-none">                  
        {months.map(renderMonth)}
      </ol>
    </div>
  )
}

export default Timeline