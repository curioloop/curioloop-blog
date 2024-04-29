'use client';

import clsx from 'clsx';
import Link from 'next/link';
import {usePathname} from 'next/navigation'
import {ComponentProps} from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
}

export default function Navlink({href, ...rest}: Props) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      aria-current={isActive}
      className={clsx(
        'inline-block px-2 py-3 transition-colors',
        isActive ? 'text-black' : 'text-gray-400 hover:text-gray-200'
      )}
      href={href}
      {...rest}
    />
  )
}