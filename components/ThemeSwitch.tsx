'use client';

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Dropdown from './Dropdown'

enum Themes {
  SYSTEM = 'system-theme',
  DARK = 'dark-theme',
  LIGHT = 'light-theme'
}

export default function ThemeSwitch() {

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const t = useTranslations('Navbar')

  const {theme:currentTheme, setTheme} = useTheme()
  const themes = {
    [Themes.SYSTEM]: 'system',
    [Themes.DARK]: 'dark',
    [Themes.LIGHT]: 'light'
  }

  const onSelected = (theme:string) => setTheme(themes[theme as Themes])
  const isSelected = (theme:string) => !!theme && theme.startsWith(currentTheme as string)
  const options = !mounted ? {} : Object.keys(themes).reduce((opts, theme) => Object.assign(opts, {[theme]:t(theme)}), {})

  return (<Dropdown isSelected={isSelected} onSelected={onSelected} options={options} >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </Dropdown>)
}