import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

import { locales } from '@/navigation'
import Timeline from '@/components/Timeline'
import Top from '@/components/Top'

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
    title: t('archive-title'),
    description: t('archive-title'),
  }
}

export default async function ArchivePage({params: {locale}} : Props) {
  unstable_setRequestLocale(locale)
  return (
    <div className="items-center xl:max-w-6xl 2xl:max-w-[88rem] my-0 mx-auto p-x2 xl:px-60 pb-11">
      <Timeline/>
      <Top/>
    </div>
  )
}