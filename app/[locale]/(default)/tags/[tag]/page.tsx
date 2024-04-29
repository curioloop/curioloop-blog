import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

import { getPostTags, getPostByTag } from '@/blogs/post'
import { locales } from '@/navigation'
import PostPreview from '@/components/PostPreview'

type Props = {
  params: {
    locale: string
    tag: string
  }
}

export async function generateStaticParams() {
  /*[
    {locale: 'en', tag: 'tag1'},
    {locale: 'en', tag: 'tag2'},
    {locale: 'zh', tag: 'tag1'},
  ]*/
  const params = await Promise.all(locales.map(async (locale) => {
    const tags = await getPostTags(locale)
    return tags.map(({tag}) => ({ locale: locale as string, tag: encodeURI(tag as string) }))
  }))
  return params.flat()
}

export async function generateMetadata({params: {locale, tag}}: Props) {
  const t = await getTranslations({locale, namespace: 'Default'})
  tag = decodeURI(tag)
  return {
    title: t('tag-title', {tag}),
    description: t('tag-title', {tag}),
  }
}

export default async function TagPage({params: {locale, tag}} : Props) {
  unstable_setRequestLocale(locale)
  const tags = await getPostByTag(locale, decodeURI(tag))
  return (
    <>
      <PostPreview posts={tags.posts.map(post => post.meta)}/>
    </>
  )
}