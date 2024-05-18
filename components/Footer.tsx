import React from 'react'

const Footer = () => (
  <footer className="p-6 text-center shadow-[0_-8px_15px_-2px_rgba(0,0,0,0.1),0_-2px_6px_-3px_rgba(0,0,0,0.1)] bg-light-bg dark:bg-dark-bg">
    <div className="md:flex justify-between xl:max-w-6xl 2xl:max-w-7xl my-0 mx-auto ">
      <div className="text-light-txt dark:text-dark-txt">Copyright © 2023 - <span>{new Date().getFullYear()}</span></div>
      <div className="text-light-txt dark:text-dark-txt">Powered by&nbsp;
        <a target="_blank" rel="noopener nofollow noreferrer" href="https://nextjs.org/">Next.js</a>
        &nbsp;&&nbsp;
        <a target="_blank" rel="noopener nofollow noreferrer" href="https://tailwindcss.com/">Tailwind CSS</a>
      </div>
    </div>
    <a target="_blank" href="https://link.zhihu.com/?target=https%3A//curioloop.com"/>
  </footer>)

export default Footer