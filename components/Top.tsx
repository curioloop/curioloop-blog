'use client';

import React from 'react'

const Top = () => {
  const scrollToTop = () => typeof window !== 'undefined' && window.scrollTo({top: 0, behavior: 'smooth'})
  return (
    <div className="fixed z-[100] right-5 bottom-5 md:right-8 md:bottom-8 p-3 md:p-5 rounded-md shadow-md
                   bg-light-bg dark:bg-dark-bg-lite hover:bg-light-bg-hov dark:hover:bg-dark-bg-lite-hov">
      <button className="block h-6 w-6 cursor-pointer hover:text-light-hov dark:hover:text-dark-hov" onClick={scrollToTop}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
        </svg>
      </button>
    </div>
  )
}

export default Top