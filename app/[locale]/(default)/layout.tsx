import { unstable_setRequestLocale } from 'next-intl/server'

import DefaultLeft from '@/components/DefaultLeft'
import DefaultRight from '@/components/DefaultRight'
import Top from '@/components/Top'

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}

export default async function DefaultLayout(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  unstable_setRequestLocale(locale)

  return (
  <div key={locale} className="grid xl:grid-cols-[23fr_54fr_23fr] md:grid-cols-[12fr_25fr] md:gap-6 
                  xl:max-w-6xl 2xl:max-w-[88rem] my-0 mx-auto p-4 md:p-6 pb-11">
      <div className="order-none min-w-0">
        {children}
      </div>
      <aside className="order-first min-w-0">
        <DefaultLeft/>
      </aside>
      <aside className="order-last min-w-0 lg:block hidden">
        <DefaultRight/>
      </aside>
      <Top/>
  </div>
  )
}