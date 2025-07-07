import React from 'react'
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations, getLocale } from 'next-intl/server'
import { BlogMeta, getPostPages } from '@/blogs/post';
import VideoPreview from './VideoPreview';
import LocaleDate from './LocaleDate';


const LatestPosts = async () => {
  const t = await getTranslations('Default')
  const locale = await getLocale()
  const {posts} = (await getPostPages(locale))
  const latest = posts.map(({meta})=> meta).sort(({date:a}, {date:b}) => new Date(b).getTime() - new Date(a).getTime())

  const renderMeta = (index:number, {slug, date, title}:BlogMeta) => (
    <div key={"post-meta-"+index} className={index == 0 ? "" : "mt-4 pt-4 border-t dark:border-dark-bg-lite"}>
      <LocaleDate className="text-sm font-extralight" date={date}/>
      <br/>
      <a className="text-sm leading-6 cursor-pointer hover:text-light-hov dark:hover:text-dark-hov" href={`${locale}/posts/${slug}`}>{title}</a>
    </div>
  )

  return (
    <div className="mt-6 p-6 overflow-auto rounded-md shadow-md bg-light-bg dark:bg-dark-bg">
    <div className="mb-4 text-sm text-light-txt dark:text-dark-txt">{t('new-post')}</div>
    {
      latest.slice(0, 5).map((meta, index) => renderMeta(index, meta))
    }
  </div>)
}

const LatestVideos = async () => {
  const t = await getTranslations('Default')
  const locale = await getLocale()
  const {posts} = (await getPostPages(locale))
  const latest = posts.map(({meta})=> meta).filter(({video})=>!!video).sort(({date:a}, {date:b}) => new Date(b).getTime() - new Date(a).getTime())

  const renderVideo = (first:boolean, {slug, video}:BlogMeta) => (
    <div key={slug} className={first ? "" : "mt-4 pt-4 border-t dark:border-dark-bg-lite"}>
      <VideoPreview slug={slug} video={video} skeletonClass="flex items-center justify-center h-48 max-w-sm rounded-md animate-pulse bg-gray-300  dark:bg-gray-700"/>
    </div>
  )

  return (
    <div className="mt-6 p-6 overflow-auto rounded-md shadow-md bg-light-bg dark:bg-dark-bg">
    <div className="mb-4 text-sm text-light-txt dark:text-dark-txt">{t('new-video')}</div>
    {
      latest.slice(0, 5).map((meta, index) => renderVideo(index==0, meta))
    }
  </div>)
}


const DefaultRight = () => {

  const t = useTranslations('Default')

  return (
    <div className="lg:sticky lg:top-6">
      <LatestPosts/>
      {/* <LatestVideos/> */}
    </div>
  )
}

export default DefaultRight