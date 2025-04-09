'use client'

import { useState, useEffect } from "react"
import DonutGraph from "@/Components/DonutGraph"
import FoodDetail1 from "./FoodDetail1"
import FoodDetail2 from "./FoodDetail2"
import { useParams } from "next/navigation"
import TitleBar from "@/Components/TitleBar"
import {FoodInterface} from "@/Interfaces/Meal_PillInterface"
import PuffLoader from "react-spinners/PuffLoader";

export default function FoodDetail() {
    const [food, setFood] = useState<FoodInterface | null>(null);
    const { id } = useParams();
    const [statePage, setStatePage] = useState(0)
    const [isLoading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        setLoading(true)
        if (!id) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/food_details/${id}`)
            .then(response => response.json())
            .then(data => {
                setFood(data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching user data:', error)

            })
    }, [id]);

    if (isLoading || !food) return <div className='flex w-screen h-screen justify-center items-center bg-sec'> <PuffLoader /> </div>

    return (
        <div className="flex justify-center flex-col items-center pb-10">
            <TitleBar title={food.recipe_name} href="/searchfood" />
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
            {statePage === 0 && <FoodDetail1 information={food.ingredient} setStatePage={setStatePage} />}
            {statePage === 1 && <FoodDetail2 information={food.recipe_method} setStatePage={setStatePage} />}


        </div>
    )
}

