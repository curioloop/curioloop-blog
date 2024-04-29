import React from 'react'

const ErrorCode = ({ errCode, locale }: {errCode : number, locale?: string}) => {

  if (!locale) locale = 'en'

  const errorIcon = <svg fill="currentColor" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 511.999 463.377">
    <path d="M289.639 9.137c12.411 7.25 23.763 18.883 33.037 34.913l.97 1.813 1.118 1.941 174.174 302.48c33.712 56.407-1.203 113.774-66.174 112.973v.12H73.485c-.895 0-1.78-.04-2.657-.112-59.104-.799-86.277-54.995-61.909-106.852.842-1.805 1.816-3.475 2.816-5.201L189.482 43.959l-.053-.032c9.22-15.786 20.717-27.457 33.411-34.805C243.788-3 268.711-3.086 289.639 9.137zM255.7 339.203c13.04 0 23.612 10.571 23.612 23.612 0 13.041-10.572 23.613-23.612 23.613-13.041 0-23.613-10.572-23.613-23.613s10.572-23.612 23.613-23.612zm17.639-35.379c-.794 19.906-34.506 19.931-35.278-.006-3.41-34.108-12.129-111.541-11.853-143.591.284-9.874 8.469-15.724 18.939-17.955 3.231-.686 6.781-1.024 10.357-1.019 3.595.008 7.153.362 10.387 1.051 10.818 2.303 19.309 8.392 19.309 18.446l-.043 1.005-11.818 142.069zM37.596 369.821L216.864 59.942c21.738-37.211 56.225-38.289 78.376 0l176.298 306.166c17.177 28.285 10.04 66.236-38.774 65.488H73.485c-33.017.756-52.841-25.695-35.889-61.775z"/>
  </svg>

  return (
    <div className="flex justify-center mt-16 mx-10 xl:p-20 overflow-auto min-h-[22rem]">
      <div className="flex retro-screen dark:gray-screen p-8 min-w-[15rem]">
        <div className="glitch">
          <div className="flex flex-col min-w-[18rem] glow-text p-6 mb-2">
            {errorIcon}
            <div className="flex flex-col items-center mt-6">
              <span className="text-5xl">{errCode}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center glow-text text-3xl text-center">
              <p><a className="glow-tag p-2 cursor-pointer break-keep" href={`/${locale}`}>HOMEPAGE</a></p>
          </div>
        </div>
      </div>
    </div>
  )

}

export default ErrorCode