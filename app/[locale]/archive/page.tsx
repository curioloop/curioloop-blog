import { getTranslations, setRequestLocale } from 'next-intl/server'

import { locales } from '@/navigation'
import Timeline from '@/components/Timeline'
import Top from '@/components/Top'

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
    title: t('archive-title'),
    description: t('archive-title'),
  }
}

export default async function ArchivePage(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale)
  return (
    <div className="items-center xl:max-w-6xl 2xl:max-w-352 my-0 mx-auto p-x2 xl:px-60 pb-11">
      <Timeline/>
      <Top/>
    </div>
  )
}