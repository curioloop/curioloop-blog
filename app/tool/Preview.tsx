'use client';

import React from "react";
import { useSearchParams } from 'next/navigation';

import clsx from 'clsx'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export default function Preview({ children, container = false }: { children: React.ReactNode, container?: boolean }) {
  const preview = useSearchParams().has('preview');
  function injectPreview(node: React.ReactNode): React.ReactNode {
    if (!preview) return node;
    if (React.isValidElement(node)) {
      const props = (node.props ?? {}) as Record<string, any>;
      const type = node.type;
      const isCustomComponent = typeof type === 'function' || (typeof type === 'object' && type !== null);
      const nextProps = isCustomComponent
        ? { ...props, preview: true }
        : props;
      return React.cloneElement(node, nextProps);
    }
    return node;
  }
  children = injectPreview(children);
  return !container ? children : <Container preview={preview}>{children}</Container>;
}

const Container = ({ children, preview }: { children: React.ReactNode, preview: boolean }) => {
  return (
    <html className="h-full [--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem]" lang="en">
      <body className={clsx(inter.className, ` antialiased text-base font-normal ${preview ? '' : 'text-light-txt bg-light-body'}`)}> 
        <main className={`min-h-screen flex flex-col items-center justify-center ${preview ? '' : 'bg-gray-50 p-4'}`}>
          {children}
          {!preview && (
          <footer className="mt-10 text-gray-400 text-xs">
            <span className="mt-1">
              © {new Date().getFullYear()} <a
                className="hover:underline hover:underline-offset-4"
                href="https://curioloop.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
              Curioloop
            </a>. All rights reserved.
            </span>
          </footer>)}
        </main>
          <GoogleAnalytics gaId="G-YP2BSVEB2C" />
      </body>
    </html>
  );
}