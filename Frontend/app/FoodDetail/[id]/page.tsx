'use client'

import { useState, useEffect } from "react"
import DonutGraph from "@/Components/DonutGraph"
import { Icon } from "@iconify/react/dist/iconify.js"
import FoodDetail1 from "./FoodDetail1"
import FoodDetail2 from "./FoodDetail2"
import { useParams } from "next/navigation"
import Link from "next/link"
import TitleBar from "@/Components/TitleBar"
import Food from "@/Interfaces/handleSearch"

export default function FoodDetail() {
    const [food, setFood] = useState<Food | null>(null); 
    const { id } = useParams();
    const [statePage, setStatePage] = useState(0)

    useEffect(() => {
        if (!id) return; 
        fetch(`http://127.0.0.1:7878/food_details/${id}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setFood(data)
            })
            .catch(error => {
                console.error('Error fetching user data:', error)
    
            })
    }, [id]);

    if (!food) return <div>ไม่มีฟู้ด</div>

    return(
        <div className="flex justify-center flex-col items-center pb-10">
          <TitleBar title={food.name} href="/searchfood"/>
            <div 
                className="flex w-full min-h-64 mt-1"
                style={{
                    backgroundImage: `url(${food.image_url})`,
                    backgroundSize: "cover", 
                    backgroundRepeat: "no-repeat", 
                    backgroundPosition: "center", 
                }}
            /> 

            <DonutGraph food={food} /> 
            {statePage === 0 && <FoodDetail1 information={food.ingredient} setStatePage={setStatePage}/>}
            {/* {statePage === 1 && <FoodDetail2 information={food?.method} setStatePage={setStatePage}/>} */}
            

        </div>
    )
}


