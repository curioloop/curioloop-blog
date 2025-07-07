import { getPostTags } from '@/blogs/post'
import { useTranslations } from 'next-intl'
import { getLocale } from 'next-intl/server'

import React from 'react'

const TopTags = async ({ className }:{className:string}) => {
  const locale = await getLocale()
  const tags = (await getPostTags(locale))
  return tags.slice(0, 10).map(tag => <a key={tag.id} className={className} href={`/${locale}/tags/${tag.id}`}>{tag.tag}</a>)
}

const DefaultLeft = () => {
  const t = useTranslations('Default')
  return (
  <div className="md:sticky md:top-6">

    <div className="retro-screen dark:gray-screen mt-6 p-6 flex justify-center">
      <div className="glow-text glitch pl-3 text-3xl md:text-2xl xl:text-xl 2xl:text-2xl">
        <p className="typewriter">for {"{"}</p>
        <p className="typewriter">&nbsp;&nbsp;curiosity();</p>
        <p className="typewriter">{"}"}</p>
      </div>
    </div>

    <div className='retro-screen dark:gray-screen mt-6'>
      <div className="mt-1 p-2">
        <div className="glow-card rounded-t-sm font-medium"><span>{t('channel-link')}</span></div>
        <div className="glow-card rounded-b-sm p-2">
          <div className="glow-text text-xl">
            {/* <a className="glow-link flex flex-row p-2 cursor-pointer rounded-sm" href="/" target="_blank">
              <svg className="min-w-[2rem] h-8" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />  
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
              <span className="mt-1 ml-4">Youtube</span>
            </a>
            <a className="glow-link flex flex-row p-2 cursor-pointer rounded-sm" href="/" target="_blank">
              <svg className="min-w-[2rem] h-8" viewBox="2 2 21 21" fill="currentColor"  stroke="currentColor" strokeWidth="0"  strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.172 2.757L10.414 6h3.171l3.243-3.242a1 1 0 0 1 1.415 1.415l-1.829 1.827L18.5 6A3.5 3.5 0 0 1 22 9.5v8a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 2 17.5v-8A3.5 3.5 0 0 1 5.5 6h2.085L5.757 4.171a1 1 0 0 1 1.415-1.415zM18.5 8h-13a1.5 1.5 0 0 0-1.493 1.356L4 9.5v8a1.5 1.5 0 0 0 1.356 1.493L5.5 19h13a1.5 1.5 0 0 0 1.493-1.356L20 17.5v-8A1.5 1.5 0 0 0 18.5 8zM8 11a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zm8 0a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1z"></path>
              </svg>
              <span className="mt-1 ml-4">Bilibili</span>
            </a> */}
            <a className="glow-link flex flex-row p-2 cursor-pointer rounded-sm" href="https://github.com/curioloop" target="_blank">
              <svg className="min-w-[2rem] h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="mt-1 ml-4">GitHub</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 p-2">
        <div className="glow-card rounded-t-sm font-medium"><span>{t('hot-tag')}</span></div>
        <div className="glow-card rounded-b-sm p-3">
          <div className="glow-text flex flex-wrap gap-x-3 gap-y-4">
            <TopTags className="glow-tag p-1 text-md cursor-pointer break-keep" />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default DefaultLeft