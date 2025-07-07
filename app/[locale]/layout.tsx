import '../globals.css'

import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server';

import {locales} from '@/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}

export default async function RootLayout(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  // reject unsupported locales
  if (!locales.includes(locale as any)) notFound()
  setRequestLocale(locale)
  const messages = (await import(`../../messages/${locale}.json`)).default
  return (
    <AppLayout locale={locale}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Navbar/>
          <main className="min-h-[calc(100vh-12.5rem)] md:min-h-[calc(100vh-11.5rem)] xl:min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer/>
      </NextIntlClientProvider>
    </AppLayout>
  )
}