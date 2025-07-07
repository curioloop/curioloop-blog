import {createNavigation} from 'next-intl/navigation';
import {Pathnames} from 'next-intl/routing';

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
  createNavigation({
    locales,
    pathnames
  });