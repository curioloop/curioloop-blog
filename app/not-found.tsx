'use client';
 
import {usePathname} from 'next/navigation';

import AppLayout from "@/components/AppLayout"
import ErrorCode from "@/components/ErrorCode"
import { locales } from '@/navigation';
 
export default function NotFound() {
  const pathname = usePathname()
  let [locale] = pathname.split('/').filter(s => s)
  if (!locales.includes(locale as any)) locale = ''
  return <AppLayout><ErrorCode errCode={404} locale={locale}/></AppLayout>
}