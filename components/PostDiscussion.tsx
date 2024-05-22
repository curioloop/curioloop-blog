'use client'
 
import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
 
const PostDiscussion = ({ locale }: { locale:string }) => {
  const { theme:currentTheme, setTheme } = useTheme()
  const lang = locale == "zh" ? "zh-CN" : "en"
  const theme = currentTheme == "dark" ? "noborder_gray" : "light_protanopia"
  
  const pathname = window.location.pathname
  const term = pathname.replace(`/${locale}`, '')

	return (
    <Giscus
      id="comments"
      repo="curioloop/curioloop-blog"
      repoId="R_kgDOL0k91Q"
      category="Announcements"
      categoryId="DIC_kwDOL0k91c4CfiNa"
      term={term}
      mapping="specific"
      emitMetadata="0"
      inputPosition="top"
      theme={theme}
      lang={lang}
      loading="lazy"/>
	)
}

export default PostDiscussion