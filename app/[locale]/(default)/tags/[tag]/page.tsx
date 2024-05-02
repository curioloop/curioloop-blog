import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

import { getPostTags, getPostByTag, tagTranslator } from '@/blogs/post'
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
    {locale: 'zh', tag: 'tag2'},
  ]*/
  const params = await Promise.all(locales.map(async (locale) => {
    const tags = await getPostTags(locale)
    return tags.map(({id}) => ({ locale: locale as string, tag: id }))
  }))
  return params.flat()
}

export async function generateMetadata({params: {locale, tag:id}}: Props) {
  const t = await getTranslations({locale, namespace: 'Default'})
  const tag = (await tagTranslator(locale, false))(id)
  return {
    title: t('tag-title', {tag}),
    description: t('tag-title', {tag}),
  }
}

export default async function TagPage({params: {locale, tag:id}} : Props) {
  unstable_setRequestLocale(locale)
  const tags = await getPostByTag(locale, id)
  return (
    <>
      <PostPreview posts={tags.posts.map(post => post.meta)}/>
    </>
  )
}