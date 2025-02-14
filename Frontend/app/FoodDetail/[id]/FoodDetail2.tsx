'use client'
import {FoodInterface} from '@/Interfaces/FoodInterface'
import { info } from 'console'
import React from 'react'



const FoodDetail2: React.FC<{information:FoodInterface['recipe_method'], setStatePage: (page: number) => void }> = ({information, setStatePage}) =>{
    
    return(
        <div className='flex relative w-full h-full flex-col items-center mt-6'>
            <div className="flex absolute w-11/12 min-h-16 rounded-xl border border-grey300 bg-sec">
                <div className="flex w-1/2  rounded-xl m-1 drop-shadow-xl text-black justify-center items-center text-body1"
                onClick={() => setStatePage(0)}>
                วัตถุดิบ
                </div>
                <div className="flex w-1/2 bg-orange300 rounded-xl m-1 drop-shadow-xl text-white justify-center items-center text-body1"
                onClick={() => setStatePage(1)}>
                ขั้นตอนการทำ
                </div>
            </div>

            <div className="flex w-11/12 flex-col min-h-16 rounded-b-xl bg-sec justify-center items-center pb-3 pt-16 ">
                {information.map((data, index) => (
                    <div key={index} className="flex w-11/12 min-h-8 bg-sec mt-8">
                        <div className="flex w-full justify-start items-center">{data}</div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default FoodDetail2