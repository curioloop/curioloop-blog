import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

import { getPostPage, getPostPages } from '@/blogs/post'
import { locales } from '@/navigation'
import PostPreview from '@/components/PostPreview'
import Pagination from '@/components/Pagination'

type Props = {
  params: Promise<{
    locale: string
    index: string
  }>
}

export async function generateStaticParams() {
  /*[
    {locale: 'en', index: 1},
    {locale: 'en', index: 2},
    {locale: 'zh', index: 1},
  ]*/
  const params = await Promise.all(locales.map(async (locale) => {
    const {indices} = await getPostPages(locale)
    return indices.map((index) => ({ locale: locale as string, index: index.toString() }))
  }))
  return params.flat()
}

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const {
    locale,
    index
  } = params;

  const t = await getTranslations({locale, namespace: 'Default'})
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function IndexPage(props: Props) {
  const params = await props.params;

  const {
    locale,
    index
  } = params;

  unstable_setRequestLocale(locale)
  // hack for home redirection, maybe use client component instead ?
  const pathPrefix = Number(index) == 0 ? `${locale}/page/` : ''
  const {posts, current, total} = await getPostPage(locale, Math.max(1, Number(index)))
  return (
    <>
      <PostPreview posts={posts.map(post => post.meta)}/>
      <Pagination current={current} total={total} pathPrefix={pathPrefix} />
    </>
  )
}