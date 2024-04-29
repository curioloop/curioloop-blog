'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname, localeLangs} from '@/navigation';
import Dropdown from './Dropdown';


export default function LocaleSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const onSelected = (nextLocale:string) => locale != nextLocale && router.replace(pathname, {locale: nextLocale})
  const isSelected = (thisLocale:string) => !!thisLocale && locale == thisLocale

  return (<Dropdown isSelected={isSelected} onSelected={onSelected} options={localeLangs} >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
          </Dropdown>)
}