import { setRequestLocale } from 'next-intl/server';
import { notFound } from "next/navigation";

import { buildIndexJSON } from "@/blogs/post"
import { locales } from "@/navigation"

export async function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export async function GET(req: Request, props:{params: Promise<{locale:string}>}) {
  const params = await props.params;

  const {
    locale
  } = params;

  if (!locales.includes(locale as any)) notFound()

  setRequestLocale(locale)
  const json = await buildIndexJSON(locale)
  const buffer = Buffer.from(json, 'utf8')
  const headers = new Headers()
  headers.append('Content-Disposition', 'attachment; filename="index.json"')
  headers.append('Content-Type', 'application/json')
  return new Response(buffer, {headers})
}