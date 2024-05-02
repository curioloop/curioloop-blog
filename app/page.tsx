
import { redirect } from 'next/navigation';

export default function Index() {
  const lang = process.env.DEFAULT_LANG || 'en'
  return redirect(`/${lang}`)
}