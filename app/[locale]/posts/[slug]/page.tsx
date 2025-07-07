
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { locales } from '@/navigation'
import { getPostBySlug, getPostPages } from '@/blogs/post'
import { notFound } from 'next/navigation'
import PostArticle from '@/components/PostArticle'
import PostSidebar from '@/components/PostSidebar'
import Top from '@/components/Top'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  /*[
    {locale: 'en', slug: 'post-1'},
    {locale: 'en', slug: 'post-2'},
    {locale: 'zh', slug: 'post-1'}
  ]*/
  const params = await Promise.all(locales.map(async (locale) => {
    const {posts} = await getPostPages(locale)
    return posts.map((post) => ({ locale: locale as string, slug: post.meta.slug }))
  }))
  return params.flat()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const {meta} = await getPostBySlug(locale, slug)
  return meta
}

export default async function PostPage(props: Props) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  setRequestLocale(locale)

  const post = await getPostBySlug(locale, slug)

  if (!post) notFound()

  return (
  <div className="grid md:grid-cols-[1fr_3fr] md:gap-6 
                  xl:max-w-6xl 2xl:max-w-352 my-0 mx-auto p-4 md:p-6 pb-11">
      <aside className="order-first min-w-0 md:block hidden">
        <PostSidebar post={post}/>
      </aside>
      <aside className="order-last min-w-0">
        <PostArticle post={post}/>
      </aside>
      <Top/>
  </div>
  )
}