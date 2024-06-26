import fs from "fs/promises"
import { marked } from "marked"
import striptags from "striptags"
import matter from "gray-matter"
import { locales } from "@/navigation"
import { SearchDoc } from "./search"
import { createTranslator } from 'next-intl'

export const postPerPage = 5 as const

export type BlogMeta = {
  slug: string
  cover: string
  video: string
  title: string
  summary: string
  category: string
  tags: {[key:string]:string}
  date: string
}

export type BlogPost = {
  meta: BlogMeta
  content: string
}

export type BlogPages = {
  posts: BlogPost[]
  indices : number[]
}

export type BlogPage = {
  posts: BlogPost[]
  current: number
  total : number
}

export type BlogTag = {
  id: string
  tag : string
  posts: BlogPost[]
}

export function fixPostImage(src:string) {
  if (!src.startsWith('http')) {
    const cdn = process.env.CDN_URL || ''
    return cdn + src
  }
  return src
} 

export async function getPostPages(locale:string) : Promise<BlogPages> {
  const posts = await loadPosts(locale)
  const total = Math.trunc(posts.length / postPerPage) + 
                Math.trunc(posts.length % postPerPage)
  const indices = Array(total).fill(1).map((v,i)=>v+i)
  return { posts, indices }
}

export async function getPostPage(locale:string, index:number) : Promise<BlogPage> {
  const pages = await getPostPages(locale)
  if (typeof index == 'string') index = parseInt(index)
  if (!pages.indices.includes(index)) 
    throw Error(`page not found ${locale}/${index}`)
  const start = (index - 1) * postPerPage
  const end = index * postPerPage
  return {posts: pages.posts.slice(start, end), current: index, total: pages.indices.length}
}

export async function getPostBySlug(locale:string, slug:string) : Promise<BlogPost> {
  const posts = await loadPosts(locale, slug)
  if (!posts.length) 
    throw Error(`post not found ${locale}/${slug}`)
  return posts[0]
}

export async function getPostTags(locale:string) : Promise<BlogTag[]> {
  const posts = await loadPosts(locale)
  const tags = posts.reduce((tags, post) => { 
    Object.entries(post.meta.tags).forEach(([id, tag]) => {
      if (!tags[tag]) tags = Object.assign(tags, {[tag]: {id, tag, posts:[]}})
        tags[tag].posts.push(post)
    })
    return tags;
  }, {} as {[key: string]: BlogTag} )
  return Object.values(tags).sort(({posts:{length:a}},{posts:{length:b}})=> a - b).toReversed()
}

export async function getPostByTag(locale:string, tagId:string) : Promise<BlogTag> {
  const tags = await getPostTags(locale)
  const post = tags.find((post) => post.id == tagId)
  if (!post) 
    throw Error(`tag id not found ${locale}/${tagId}`)
  return post
}

export async function getPostTimeline(locale:string) : Promise<{[key:string]:BlogMeta[]}> {
  const posts = await loadPosts(locale)
  const timeline = posts.reduce((months, {meta}) => { 
    const date = new Date(meta.date)
    const month = `${date.getFullYear()}-${date.getMonth()}`
    if (!months[month]) months = Object.assign(months, {[month]: []}) 
    months[month].push(meta)
    return months
  }, {} as {[key:string]:BlogMeta[]})
  for (const month in timeline) {
    const metas = timeline[month]
    timeline[month] = metas.sort(({date:a}, {date:b}) => new Date(b).getTime() - new Date(a).getTime())
  }
  return timeline
}

export async function buildIndexJSON(locale:string) {
  if (!locales.includes(locale as any)) 
    throw Error(`unknown locale ${locale}`)

  const posts = await loadPosts(locale)
  const documents = posts.map(({meta:{slug, title, tags}, content:mdx}) => {
    const html = marked.parse(mdx)
    const text = striptags(html)
    return {slug, title, tags: Object.values(tags), content:text.replace(/\s+/g, ' ')} satisfies SearchDoc
  })
  
  return JSON.stringify(documents)
}


const postCacheTTL = parseInt(process.env.POST_CACHE_TTL || '3')
const postCache = {} as { [key: string] : {
  posts: BlogPost[]
  ttl: number
}}

async function loadPosts(locale:string, slug?:string) : Promise<BlogPost[]> {
  
  if (!locales.includes(locale as any)) 
    throw Error(`unknown locale ${locale}`)

  let version = postCache[locale]
  if (!version || version.ttl < Date.now()) {
    const posts = await fetchPosts(locale)
    posts.sort(({meta:{date:a}}, {meta:{date:b}}) => new Date(b).getTime() - new Date(a).getTime())
    version = { posts, ttl: Date.now() + postCacheTTL * 1000 }
    postCache[locale] = version
  }

  if (!slug) return version.posts
  return version.posts.filter(post => post.meta.slug == slug)
}

async function fetchPosts(locale:string) : Promise<BlogPost[]>{

  const ext = '.mdx'
  const dir = `blogs/${locale}`
  const files = await fs.readdir(dir)
  const toSlug = (file:string) => file.endsWith(ext) ? file.replace(ext, '') : ''

  const markdowns = await Promise.all(files.map(async (category) => {
    const path = `${dir}/${category}`
    if ((await fs.stat(path)).isDirectory()) {
      return (await fs.readdir(path)).filter(toSlug).map((f) => ({category, path:`${path}/${f}`, slug:toSlug(f)}))
    } else {
      const slug = toSlug(category)
      return slug ? [{category: '', path, slug}] : []
    }
  }))

  const t = await tagTranslator(locale, true)
  const promises = markdowns.flat().map(async ({category, path, slug}) => {
    const source = await fs.readFile(path, 'utf8')
    const { content, excerpt: summary, data } = matter(source, {
        excerpt: true,
        excerpt_separator: '[comment]:summary',
    })

    data.tags = (data.tags || []).reduce((tags: {[key: string]: string}, v:string) => { 
      tags[t(v)] = v
      return tags;
    }, {} as {[key: string]: string} )

    if (data.cover) data.cover = fixPostImage(data.cover)
    return { meta: {...data, slug, summary, category} as BlogMeta, content } satisfies BlogPost
  })
  
  return await Promise.all(promises)

}

export async function tagTranslator(locale:string, flip:boolean) {
  const {Tag:messages} = (await import(`@/messages/${locale}.json`)).default;
  const flipKV = (data:{[key:string]:string}) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]))
  return createTranslator({ locale, messages: flip ? flipKV(messages): messages })
}