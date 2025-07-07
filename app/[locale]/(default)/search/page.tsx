import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

import { locales } from '@/navigation'
import SearchEngine from '@/components/SearchEngine'
import TagCloud from '@/components/TagCloud'


type Props = {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({locale, namespace: 'Default'})
  return {
    title: t('search-title'),
    description: t('search-title'),
  }
}

export default async function SearchPage(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  unstable_setRequestLocale(locale)
  return <SearchEngine><TagCloud/></SearchEngine>
}