import clsx from 'clsx'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode;
  locale?: string;
}

export default function AppLayout({children, locale}: Props) {
  return (
    <html className="h-full [--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem]" lang={locale}>
      <body className={clsx(inter.className, 'flex flex-col text-base font-normal antialiased text-light-txt dark:text-dark-txt bg-light-body dark:bg-dark-body')}> 
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}