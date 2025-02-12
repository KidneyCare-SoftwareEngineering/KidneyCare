'use client'
import FoodInterface from '@/Interfaces/handleSearch'
import { info } from 'console'
import React from 'react'


const FoodDetail1: React.FC<{information:FoodInterface['ingredient'], setStatePage: (page: number) => void }> = ({information, setStatePage}) =>{
    return(
        <div className='flex relative w-full h-full flex-col items-center mt-6'>
            <div className="flex absolute w-11/12 min-h-16 rounded-xl border border-grey300 bg-sec">
                <div className="flex w-1/2 bg-orange300 rounded-xl m-1 drop-shadow-xl text-white justify-center items-center text-body1"
                onClick={() => setStatePage(0)}>
                วัตถุดิบ
                </div>
                <div className="flex w-1/2  rounded-xl m-1 drop-shadow-xl text-black justify-center items-center text-body1"
                onClick={() => setStatePage(1)}>
                ขั้นตอนการทำ
                </div>
            </div>

            <div className="flex w-11/12 flex-col min-h-16 rounded-b-xl bg-sec justify-center items-center pb-3 pt-16 ">
                <div className="flex w-11/12 min-h-8 rounded-xl bg-sec mt-4 ">
                    <div className="flex w-8/12 text-body1 justify-start items-center">ส่วนผสมสำหรับ</div>
                    <div className="flex w-4/12 text-body2 text-grey500 justify-end items-center ">1 จาน</div>
                </div>
                {information.map((ingredient, index) => (
                    <div key={index} className="flex w-11/12 min-h-8 bg-sec mt-4 border-b border-gray500">
                        <div className="flex w-8/12 justify-start items-center ">{ingredient.ingredient_name}</div>
                        <div className="flex w-4/12 text-body2 text-grey500 justify-end items-center ">{ingredient.ingredient_amount} {ingredient.ingredient_unit}</div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default FoodDetail1