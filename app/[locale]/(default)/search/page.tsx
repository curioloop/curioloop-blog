import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

import { locales } from '@/navigation'
import SearchEngine from '@/components/SearchEngine'
import TagCloud from '@/components/TagCloud'


type Props = {
  params: {
    locale: string
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export async function generateMetadata({params: {locale}}: Props) {
  const t = await getTranslations({locale, namespace: 'Default'})
  return {
    title: t('search-title'),
    description: t('search-title'),
  }
}

export default async function SearchPage({params: {locale}} : Props) {
  unstable_setRequestLocale(locale)
  return <SearchEngine><TagCloud/></SearchEngine>
}