'use client'

import { Icon } from "@iconify/react/dist/iconify.js"

export default function FoodDetail() {
    return(
        <>
            <div className="relative flex justify-center items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold">
                <Icon
                    icon="majesticons:arrow-left"
                    className="absolute left-4"
                    height="28"
                />
                สลัดอกไก่ย่าง
            </div>
            <div 
                className="flex w-full min-h-64 max"
                style={{
                    backgroundImage: "url(https://picsum.photos/200)",
                    backgroundSize: "cover", 
                    backgroundRepeat: "no-repeat", 
                    backgroundPosition: "center", 
                }}
            /> 

        </>
    )
}