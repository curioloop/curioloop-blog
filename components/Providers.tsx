'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// https://nextjs.org/docs/messages/react-hydration-error
const NoSSRThemeProvider = dynamic(async () => {
  const { ThemeProvider } = await import('next-themes') // This should be the Redux provider
  return ThemeProvider
}, { ssr: false })

export function Providers({ children } : { children: ReactNode }) {
  return (
    <NoSSRThemeProvider attribute="class">
        {children}
    </NoSSRThemeProvider>
  );
}