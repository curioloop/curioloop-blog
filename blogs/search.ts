import { text } from 'stream/consumers'
import useSWR from 'swr'

export type SearchDoc = {
  slug: string
  title: string
  tags: string[]
  content: string
}

export type SearchResult = {
  document: SearchDoc
  indices: {
    slug?: [number,number][]
    title?: [number,number][]
    content?: [number,number][]
  }
}

export const searchDocs = (documents:SearchDoc[], keyword:string) => {
  if (!keyword.length) return null

  const splitWhiteSpace = (text:string) => text.split(/\s+/)
  const removePunctuation = (text:string) => text.replace(/[^\w\u4e00-\u9fa5]/g, '')
  const safeWords = splitWhiteSpace(keyword).map(removePunctuation).filter(txt => !!txt)
  if (!safeWords.length) return null

  const pattern = `${safeWords.join('|')}`
  const match = (text:string) => {
    const indices = []
    const regex = new RegExp(pattern, 'idg')
    let match, count = 0
    while ((match = regex.exec(text)) !== null) {
      if (match.indices) indices.push(match.indices[0])
      if (count++ > 10) break
    }
    if (indices.length) return indices
  }

  const result:SearchResult[] = []
  for (const i in documents) {
    const doc = documents[i]
    const slug = match(doc.slug)
    const title = match(doc.title)
    const content = match(doc.content)
    if (slug || title || content) {
      result.push({
        document: documents[i],
        indices: {slug, title, content}
      })
    }
  }
  return result
}

export const useSearchDocs = () => {

  const fetcher = (url:string) => fetch(url).then(async (res) => {
    const json = await res.json()
    return json as SearchDoc[]
  })
  
  const { data:docs, isLoading, error } = useSWR(`search/index.json`, fetcher)
  return { docs, isLoading, error }
}