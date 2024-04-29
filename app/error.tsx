'use client';

import AppLayout from '@/components/AppLayout';
import ErrorCode from '@/components/ErrorCode';
import { locales } from '@/navigation';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'

export default function Error({ 
  error, reset
} : {
  error: Error,
  reset: () => void,
}) {

  useEffect(() => {
    // Log the error to an error reporting service
    console.log(error)
  }, [error])

  const pathname = usePathname()
  let [locale] = pathname.split('/').filter(s => s)
  if (!locales.includes(locale as any)) locale = ''
  return <AppLayout><ErrorCode errCode={500} locale={locale}/></AppLayout>
}