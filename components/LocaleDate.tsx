import React from 'react'
import { useFormatter, useLocale } from 'next-intl'

type Props = {
  className: string
  date?: Date | string
  month?: Date | string
}

const LocaleDate = ({date:dateVal, month:monthVal, className}: Props) => {

  const locale = useLocale()
  const formatter = useFormatter()
  const date = !!dateVal ? new Date(dateVal) : null
  const month = !!monthVal ? new Date(monthVal) : null

  return date ? ( 
    <time className={className}>{
      locale == 'zh' ? `${date.toISOString().split('T')[0]}` :
      formatter.dateTime(date, { year: 'numeric', month: 'long', day: 'numeric' })
    }</time>
  ) : month ? ( 
    <time className={className}>{
      locale == 'zh' ? `${month.getFullYear()}-${month.getMonth().toString().padStart(2, '0')}` :
      formatter.dateTime(month, { year: 'numeric', month: 'long'})
    }</time>
  ) : <></>
}

export default LocaleDate