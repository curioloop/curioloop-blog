
import { FocusEvent, useState } from 'react'

type Props = {
  children: React.ReactNode
  options: {[key:string]:string}
  isSelected: (key:string) => boolean
  onSelected: (key:string) => void
}

const Dropdown = ({children, options, isSelected, onSelected}: Props) => {

  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(old => !old)
  const toggleClass = isOpen ?  "" : "hidden"

  const onClick = (key:string) => {
    onSelected(key)
    setIsOpen(false)
  }

  const blurClose  = (event:FocusEvent) => {
    const {currentTarget, relatedTarget} = event
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setIsOpen(false)
    }
  }

  return (
    <div onBlur={(e) => blurClose(e)}>
      <div>
      <button className="h-6 w-6" onClick={toggle}>
          {children}
        </button>
      </div>
      <div className={`${toggleClass} absolute origin-top-right w-32 mt-6 -ml-12 py-1 shadow-lg rounded-md bg-light-bg dark:bg-dark-bg-lite`}>
        {Object.entries(options).map(([key, val]) => (
           <button className={`block w-full px-4 py-2 text-sm hover:bg-light-bg-hov dark:hover:bg-dark-bg-lite-hov ${isSelected(key) ? "font-bold text-light-hov dark:text-dark-hov" : "text-light-txt dark:text-dark-txt"}`} 
                   key={key} onClick={() => onClick(key)}>{val}</button>
        ))}
      </div>
    </div>
  );
}

export default Dropdown