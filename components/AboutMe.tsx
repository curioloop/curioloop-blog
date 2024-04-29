import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Logo from './Logo'

const AboutMe = () => {

  const locale = useLocale()
  const t = useTranslations('About')

  const quote = (rotate:boolean) => <svg className={`${rotate ? 'rotate-180': ''} inline mx-2 w-2 h-3`}  fill="currentColor" viewBox="0 0 18 14">
      <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>

  return (
    <div className="mt-16 p-6 mx-10 xl:p-16 xl:-mx-20 2xl:-mx-10 overflow-auto min-h-[30rem] h-full rounded-md shadow-md text-light-txt dark:text-dark-txt bg-light-bg dark:bg-dark-bg">
      <div className="grid grid-cols-3">
        <div className="flex flex-col min-w-[19rem] bulb-glow text-sky-600 dark:text-dark-txt">
          <Logo className=''/>
          <div className="flex flex-col items-center mt-10">
            <blockquote className="mx-5 text-xl italic font-semibold text-center">
              {quote(true)} {t('description')} {quote(false)}
            </blockquote>
          </div>
        </div>
        <div className="col-span-2">
        </div>
      </div>
    </div>
  )
}

export default AboutMe