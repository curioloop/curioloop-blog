import { getTranslations, setRequestLocale } from 'next-intl/server'

import { locales } from '@/navigation'
import AboutMe from '@/components/AboutMe'

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

  const t = await getTranslations({locale, namespace: 'About'})
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function AboutPage(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale)
  return (
    <div key={locale} className="items-center xl:max-w-6xl 2xl:max-w-[88rem] my-0 mx-auto p-x2 xl:px-60 pb-11">
      <AboutMe/>
    </div>
  )
}