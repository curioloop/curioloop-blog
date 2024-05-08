import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

interface PaginationProps {
  total : number
  current: number
  pathPrefix: string
}

const Pagination = ({ total, current, pathPrefix }:PaginationProps) => {

  if (typeof(current) == 'string') current = parseInt(current)
  if (typeof(total) == 'string') total = parseInt(total)

  const t = useTranslations('Pagination')
  const locale = useLocale()

  const flexPlaceholder = <div className="my-0 mx-1 px-3 py-2 w-[4.5rem]"/>
  const pageEllipsis = <div className="my-0 mx-1 px-2 py-2 min-w-[1em] ">...</div>

  const pageBtn = (pageNo:number) => pageNo == current ? (
    <div key={pageNo} className="my-0 mx-1 px-3 py-2 min-w-[1.5em] rounded-md shadow-md bg-light-bg-hov dark:bg-dark-bg-hov">
      <a className="cursor-default">{pageNo}</a>
    </div>
  ) : (
    <div key={pageNo} className="my-0 mx-1 px-3 py-2 min-w-[1.5em] rounded-md shadow-md bg-light-bg dark:bg-dark-bg hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov">
      <a className="hover:text-light-hov dark:hover:text-dark-hov" href={`${pathPrefix}${pageNo}`}>{pageNo}</a>
    </div>
  )

  /**
   * 4 种可能的分页样式，假设最多有 10 页
   * 页数不大于 5   ｜1｜2｜3｜4｜5｜
   * 第 1-2 页     ｜1｜2｜ ... ｜10｜
   * 第 3-8 页     ｜1｜ ... ｜5｜6｜7｜ ... ｜10｜
   * 第 9-10 页    ｜1｜ ... ｜9｜10｜
   */
  const numRange = (from:number, to:number) => Array(to - from + 1).fill(from).map((v,i) => v+i)
  const btnRange = (from:number, to:number) => numRange(from, to).map(pageBtn)

  const btnRender = (total <= 5) ? () => btnRange(1, total) :
                    (current <= 2) ? () => <>{btnRange(1, 3)} {pageEllipsis} {btnRange(total, total)}</> :
                    (total - current <= 1) ? () => <>{btnRange(1, 1)} {pageEllipsis} {btnRange(total-2, total)}</> :
                    () => <>{btnRange(1, 1)} {pageEllipsis} {btnRange(current-1, current+1)} {pageEllipsis} {btnRange(total, total)}</>

  return (
  <nav className="flex justify-between items-center text-center mb-0 mt-6 -mx-1">
      {
        current <= 1 ? flexPlaceholder : (
          <div className="my-0 mx-1 px-3 py-2 rounded-md shadow-md bg-light-bg dark:bg-dark-bg hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov">
            <a className="hover:text-light-hov dark:hover:text-dark-hov" href={`${pathPrefix}${current-1}`}>{t("prev-page")}</a>
          </div>
        )
      }
      
      <div className="md:hidden text-center">{current}/{total}</div>
      <div className="hidden md:flex justify-center flex-wrap">
        {btnRender()}
      </div>

      {
        current >= total ? flexPlaceholder : (
          <div className="my-0 mx-1 px-3 py-2 rounded-md shadow-md bg-light-bg dark:bg-dark-bg hover:bg-light-bg-hov dark:hover:bg-dark-bg-hov">
            <a className="hover:text-light-hov dark:hover:text-dark-hov" href={`${pathPrefix}${current+1}`}>{t("next-page")}</a>
          </div>
        )
      }
    </nav>)
}

export default Pagination