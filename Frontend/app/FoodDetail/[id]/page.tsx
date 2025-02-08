'use client'

import { useState, useEffect } from "react"
import DonutGraph from "@/Components/DonutGraph"
import { Icon } from "@iconify/react/dist/iconify.js"
import FoodDetail1 from "./FoodDetail1"
import FoodDetail2 from "./FoodDetail2"
import { useParams } from "next/navigation"
import Link from "next/link"
import TitleBar from "@/Components/TitleBar"

export default function FoodDetail() {

    const { id } = useParams();
    const food = foodData.find((item) => Number(id) === item.id);
    if (!food) {
        return <div>ไม่พบข้อมูลอาหาร</div>;
    }
    const [statePage, setStatePage] = useState(0)

    return(
        <div className="flex justify-center flex-col items-center">
          <TitleBar title={food.name}/>
            <div 
                className="flex w-full min-h-64 mt-1"
                style={{
                    backgroundImage: `url(${food.imageUrl})`,
                    backgroundSize: "cover", 
                    backgroundRepeat: "no-repeat", 
                    backgroundPosition: "center", 
                }}
            /> 

            {/* <DonutGraph/> 
            {statePage === 0 && <FoodDetail1 setStatePage={setStatePage}/>}
            {statePage === 1 && <FoodDetail2 setStatePage={setStatePage}/>} */}
            

        </div>
    )
}


