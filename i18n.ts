import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async (params) => {
  const locale = params.locale || await params.requestLocale || 'en'
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});