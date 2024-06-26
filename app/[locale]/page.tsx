
import { locales } from '@/navigation';
import DefaultLayout from './(default)/layout';
import IndexPage from './(default)/page/[index]/page';

export async function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default function Home({ params: {locale}} : {params: {locale: string}}) {
  // 使用 redirect(`/${locale}/page/0`) 效果相同，但会改变 URL
  return (<DefaultLayout params={{locale}} > 
            <IndexPage params={{index:'0', locale}}/>
          </DefaultLayout>)
}