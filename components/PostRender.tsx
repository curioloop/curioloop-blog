import React, { 
  FunctionComponent,
  HtmlHTMLAttributes,  
  DetailedHTMLProps,
  AnchorHTMLAttributes,
  CSSProperties
} from 'react'

import Link from 'next/link'

import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import remarkMath from 'remark-math'
import rehypeSlug from "rehype-slug"
import rehypeRaw from 'rehype-raw'
import rehypeMathjax from 'rehype-mathjax'
import rehypePrettyCode from "rehype-pretty-code"

import { BlogPost, fixPostImage } from '@/blogs/post'
import VideoPreview from "@/components/VideoPreview"
import PreviewLink from "@/components/PreviewLink"
import PostContent from './PostContent'
import clsx from 'clsx'
import mermaidGraph from '@/blogs/graph'
import { parse } from 'path'

type Props = {
  post: BlogPost
}

const PostLink: FunctionComponent<
DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
> = ({ children, href }) => {
  const className = "no-underline hover:underline text-light-hov dark:text-dark-hov"

  const match = href?.match(/^(\d+)x(\d+):(.+)$/);
  if (match) {
    const w = parseInt(match[1]), h = parseInt(match[2]), href = match[3];
    return href.startsWith('http') ? (
      <PreviewLink href={href} width={w} height={h} linkClass={className} target="_blank" rel="noopener noreferrer external nofollow">
        {children}
      </PreviewLink>
    ) : <PreviewLink href={href} width={w} height={h} linkClass={className}>
        {children}
      </PreviewLink>;
  }

  return href?.startsWith('http') ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer external nofollow">
      {children}
    </a>
  ) : href?.startsWith('#') ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href || ''} className={className}>
      {children}
    </Link>
  )
}

const PostPre: FunctionComponent<
DetailedHTMLProps<HtmlHTMLAttributes<HTMLPreElement>, HTMLPreElement>
> = ({ children, ...props }) => {
  props.className = clsx(props.className, 'shadow-inner')
  return (
    <pre {...props}>
      {children}
    </pre>
  )
}

const PostImg: FunctionComponent<
DetailedHTMLProps<HtmlHTMLAttributes<HTMLImageElement>, HTMLImageElement>
> = ({ children, ...props }) => {
  const {alt: meta, src} = props as {src:string, alt:string}
  const [alt, params] = (meta || '').split('?')
  const attrs = Object.fromEntries(new URLSearchParams(params))
  const align = attrs['align'] || 'center'
  return (
    <span {...{align}}>
      <img src={fixPostImage(src)} alt={alt} {...attrs}>
        {children}
      </img>
    </span>
  )
}


const PostRender = async ({ post }:Props) => {

  const {content} = await compileMDX({
      source: post.content, 
      components: {
        a: PostLink,
        pre: PostPre,
        img: PostImg,
        VideoPreview,
      },
      options: { 
        mdxOptions: { 
          remarkPlugins: [
            remarkGfm,
            remarkMath,
            mermaidGraph,
          ],
          rehypePlugins: [
            rehypeRaw,
            rehypeSlug,
            rehypeMathjax,
            [rehypePrettyCode, {
              theme: {
                dark: "one-dark-pro",
                light: "github-light",
              }
            }]
        ]}
      }
    })

  return (
    <section style={{contain: 'content'}} className="mb-4 px-6 pt-4 pb-0 max-w-none prose dark:prose-invert">
      <PostContent>{content}</PostContent>
    </section>
  )
}

export default PostRender