'use client'
import React from 'react'

const FoodDetail2: React.FC<> = ({setStatePage}) =>{
    return(
        <>
            <div className="flex w-11/12 min-h-16 rounded-xl bg-sec mt-4 ">
                <div className="flex w-1/2  rounded-xl m-1 drop-shadow-xl text-black justify-center items-center text-body1"
                onClick={() => setStatePage(0)}>
                วัตถุดิบ
                </div>
                <div className="flex w-1/2  rounded-xl m-1 bg-orange300 drop-shadow-xl text-white justify-center items-center text-body1"
                onClick={() => setStatePage(1)}>
                ขั้นตอนการทำ
                </div>
            </div>
            <div className="flex w-11/12 min-h-16 rounded-xl bg-sec">
                ขั้นตอนการทำ
            </div>
        </>
    )
}

export default FoodDetail2