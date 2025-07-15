import type { Metadata } from "next";
import '../globals.css';

import clsx from 'clsx'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: "Curioloop Tool",
  description: "Curioloop Tool",
};

const inter = Inter({ subsets: ['latin'] })

export default function ToolLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full [--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem]" lang="en">
      <body className={clsx(inter.className, 'text-base font-normal antialiased text-light-txt bg-light-body')}> 
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          {children}
        </main>
        <GoogleAnalytics gaId="G-YP2BSVEB2C" />
      </body>
    </html>
  );
}
