'use client';

import React, { useState } from 'react'

const VideoPreview = ({slug, video, skeletonClass}:{slug:string, video:string, skeletonClass:string}) => {

  enum LoadingStatus { LOADING, SUCCESS, ERROR }

  const [status, setStatus] = useState(LoadingStatus.LOADING)
  
  const skeleton = <div className={skeletonClass}>
                    { status == LoadingStatus.LOADING ?
                      <svg className="h-8 w-8 text-gray-200 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"  strokeLinejoin="round">  
                        <circle cx="12" cy="12" r="10" />  
                        <polygon fill="currentColor"  points="10 8 16 12 10 16 10 8" />
                      </svg> :
                      <svg className="h-8 w-8 text-gray-200 dark:text-gray-600"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  
                        <circle cx="12" cy="12" r="10" />  
                        <line x1="15" y1="9" x2="9" y2="15" />  
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    }
                  </div>

  return <>
    {status != LoadingStatus.SUCCESS ? skeleton : <></>}
    <iframe className={`${status ? '': 'hidden'} w-full aspect-video`} src={video} title={slug} 
    onLoad={() => setStatus(LoadingStatus.SUCCESS)} onError={() => setStatus(LoadingStatus.ERROR)}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
  </>
}

export default VideoPreview