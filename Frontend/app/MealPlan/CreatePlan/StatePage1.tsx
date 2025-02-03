import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

export const StatePage1 = () => {
  return (
    <>
        <div className="flex w-11/12 h-14 rounded-xl drop-shadow-xl bg-white mt-6 px-4"> 
            <div className="flex w-11/12 justify-start items-center text-body1 font-bold"> วันที่ 1 </div>
            <div className="flex w-1/12 justify-center items-center">
                <Icon icon="weui:arrow-filled" height="24px"/>
            </div>
        </div>


        <div className="flex w-11/12 h-14 rounded-xl drop-shadow-xl bg-white mt-6 px-4 "> 
            <div className="flex w-11/12 animate-pulse justify-start items-center text-body1 font-bold"> 
                
                <div className="flex bg-slate-300 rounded-full size-8 mr-4"/>
                <div className="flex bg-slate-300 rounded-full w-8/12 h-2">
                </div>
            </div>
            <div className="flex w-1/12 animate-pulse justify-center items-center">
                <Icon icon="weui:arrow-filled" height="24px"/>
            </div>
        </div>
    </>
  )
}
