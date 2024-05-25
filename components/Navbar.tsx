import { useTranslations, useLocale } from 'next-intl'
import React from 'react'
import LocaleSwitch from './LocaleSwitch'
import Navlink from './Navlink'
import ThemeSwitch from './ThemeSwitch'
import Logo from './Logo'

const Navbar = () => {
  const locale = useLocale()
  const t = useTranslations('Navbar')
  return (
    <nav className="relative block min-h-[3rem] py-0 px-5 shadow-md border-gray-200 bg-light-bg dark:bg-dark-bg z-10">
    <div className="xl:flex xl:max-w-6xl 2xl:max-w-7xl my-0 mx-auto ">
      <h1 className="flex shrink-0 items-stretch justify-center xl:-ml-3 xl:mr-3">
        <a href={`https://curioloop.com/${locale}`} className="flex items-stretch justify-center tracking-[.5px] cursor-pointer m-0 md:px-3 md:py-4 py-3 hover:text-light-hov dark:hover:text-dark-hov">
          <Logo className="h-6 w-6 md:h-9 md:w-9 my-1 md:-my-1 mr-3"/> 
          <span className="text-lg">{t('title')}</span>
        </a>
      </h1>
      <div className="flex items-stretch justify-center grow overflow-x-auto xl:mr-3 ">
        <div className="flex items-stretch justify-start xl:mr-auto">
          <Navlink className="flex grow-0 m-0 px-3 py-4 items-center cursor-pointer text-light-txt dark:text-dark-txt hover:text-light-hov dark:hover:text-dark-hov hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov" href={`/${locale}`}>{t('home')}</Navlink>
          <Navlink className="flex grow-0 m-0 px-3 py-4 items-center cursor-pointer text-light-txt dark:text-dark-txt hover:text-light-hov dark:hover:text-dark-hov hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov" href={`/${locale}/search`}>{t('search')}</Navlink>
          <Navlink className="flex grow-0 m-0 px-3 py-4 items-center cursor-pointer text-light-txt dark:text-dark-txt hover:text-light-hov dark:hover:text-dark-hov hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov" href={`/${locale}/archive`}>{t('archive')}</Navlink>
          <Navlink className="flex grow-0 m-0 px-3 py-4 items-center cursor-pointer text-light-txt dark:text-dark-txt hover:text-light-hov dark:hover:text-dark-hov hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov" href={`/${locale}/about`}>{t('about')}</Navlink>
        </div>
        <div className="flex items-stretch justify-end ml-0">
          <div className="flex grow-0 m-0 -mb-2 px-3 py-4 z-[999] items-center text-light-txt dark:text-dark-txt hover:text-light-hov dark:hover:text-dark-hov hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov">
            <LocaleSwitch/>
          </div>
          <div className="flex grow-0 m-0 -mb-2 px-3 py-4 z-[999] items-center text-light-txt dark:text-dark-txt hover:text-light-hov dark:hover:text-dark-hov hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov">
            <ThemeSwitch/>
          </div>
        </div>
      </div>
    </div>
  </nav>
  )
}

export default Navbar