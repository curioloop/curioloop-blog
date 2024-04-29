import {Pathnames, createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'zh'] as const
export const localeLangs = {
  en: 'English',
  zh: '中文'
}

export const pathnames = {
  '/': '/',
  '/pathnames': {
    en: '/en',
    zh: '/zh'
  }
} satisfies Pathnames<typeof locales>;

export type AppPathnames = keyof typeof pathnames;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames
  });