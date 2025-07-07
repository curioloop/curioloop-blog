import React, { CSSProperties } from 'react'

import { unified } from "unified";
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkHype from "remark-rehype"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"

import striptags from "striptags"
import { BlogPost } from '@/blogs/post'
import PostToc from './PostToc';

type Props = {
  post: BlogPost
}

const PostSidebar = async ({ post : {content} }:Props) => {

  const {value:html} = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkHype)
  .use(rehypeSlug)
  .use(rehypeStringify)
  .process(content)

  const text = striptags(html as string, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
  const headings = text.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g)
  if (!headings) return <></>

  function unescape(str:string) {
    return str.replace(/&#([xX][0-9a-fA-F]+);/g, function (match, dec) {
        // @ts-ignore
        return String.fromCharCode('0' + dec);
    }).replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
}

  const tocHeads = headings.map(head => {
    const [,h,id,title] = /<h(\d+?) id="(.*?)">(.*?)</g.exec(head) || []
    return [parseInt(h),id,title] as [number, string, string]
  })

  const levels = tocHeads.map(([h]) => h).reduce((set,num) => set.add(num), new Set<number>())
  const tocLevels = Array.from(levels.values()).sort().reduce((map,num,idx) => Object.assign(map, {[num]:idx}), [] as number[])
  
  const renderHead = ([h,id,title]:[number, string, string]) => {
    const paddingLeft = (tocLevels[h] + 1) + 'rem'
    const fontSize = Math.max(0.95 - tocLevels[h] * 0.05, 0.85) + 'rem'
    const style = { paddingLeft, fontSize } as CSSProperties
    return <li key={id} className={`py-2 rounded-xs text-light-txt dark:text-dark-txt hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov`}>
        <a className="w-full" href={'#'+id}><span style={style} className={`block pr-2 break-all`}>{unescape(title)}</span></a>
      </li>
  }

  return (
    <div className="lg:sticky lg:top-6">
       <div className="mt-6 p-6 overflow-auto rounded-md shadow-md bg-light-bg dark:bg-dark-bg">
        <PostToc className='text-light-hov dark:text-dark-hov'>{tocHeads.map(renderHead)}</PostToc>
       </div>
    </div>
  )
}

export default PostSidebar