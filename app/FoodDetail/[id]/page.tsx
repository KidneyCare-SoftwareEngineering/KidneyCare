'use client'

import { useState, useEffect } from "react"
import DonutGraph from "@/Components/DonutGraph"
import { Icon } from "@iconify/react/dist/iconify.js"
import FoodDetail1 from "./FoodDetail1"
import FoodDetail2 from "./FoodDetail2"
import { useParams } from "next/navigation"
import Link from "next/link"

const foodData = [
    {
      id: 1,
      name: "สลัดอกไก่ย่าง",
      calories: 150,
      protein: 13,
      carbs: 4,
      fat: 4,
      sodium: 4,
      phosphorus: 4,
      potassium: 4,
      imageUrl: "https://picsum.photos/200"
    },
    {
      id: 2,
      name: "ข้าวมันไก่",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 6,
      sodium: 10,
      phosphorus: 5,
      potassium: 5,
      imageUrl: "https://picsum.photos/201"
    },
    {
      id: 3,
      name: "ข้าวมันไก่",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 6,
      sodium: 10,
      phosphorus: 5,
      potassium: 5,
      imageUrl: "https://picsum.photos/201"
    },
    {
      id: 4,
      name: "ข้าวมันไก่",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 6,
      sodium: 10,
      phosphorus: 5,
      potassium: 5,
      imageUrl: "https://picsum.photos/201"
    },
  ]


export default function FoodDetail() {

    const { id } = useParams();
    const food = foodData.find((item) => Number(id) === item.id);
    if (!food) {
        return <div>ไม่พบข้อมูลอาหาร</div>;
    }
    const [statePage, setStatePage] = useState(0)

    return(
        <div className="flex justify-center flex-col items-center">
            <div className="relative flex justify-center items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold ">
                <Link className="absolute left-4" href={`/SearchFood`}>
                    <Icon
                        icon="majesticons:arrow-left"
                        height="28"
                    />
                </Link>
                {food.name}
            </div>
            <div 
                className="flex w-full min-h-64 mt-1"
                style={{
                    backgroundImage: `url(${food.imageUrl})`,
                    backgroundSize: "cover", 
                    backgroundRepeat: "no-repeat", 
                    backgroundPosition: "center", 
                }}
            /> 
            

        </div>
    )
}