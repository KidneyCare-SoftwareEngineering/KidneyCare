'use client'
import { useState, useEffect } from "react"
import DonutGraph from "@/Components/DonutGraph"
import FoodDetail1 from "./FoodDetail1"
import FoodDetail2 from "./FoodDetail2"
import TitleBar from "@/Components/TitleBar"
import {FoodInterface} from "@/Interfaces/Meal_PillInterface"
import PuffLoader from "react-spinners/PuffLoader";
import TitleBarRouter from "@/Components/TitleBarRouter"


const ChooseFood: React.FC<{id: number; setChooseFood: (value: boolean) => void ; setFoodChoosedData: (value: FoodInterface) => void ; setIsSheetOpen: (value: boolean) => void ;}> = ({id, setChooseFood, setFoodChoosedData, setIsSheetOpen}) => {
    const [food, setFood] = useState<FoodInterface | null>(null);
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
        <div className="flex justify-center flex-col items-center pb-10 ">
            <TitleBarRouter title={food.recipe_name} setChooseFood={setChooseFood} setIsSheetOpen={setIsSheetOpen}/>
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

            <div className="flex fixed justify-center items-center w-screen h-20 bg-white bottom-0 rounded-t-xl z-10"
                style={{ boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.1)" }}>
                <div className="flex absolute h-4/6 w-9/12 bg-orange300 rounded-xl text-body1 font-bold text-white justify-center items-center"
                    onClick={() => {
                        setFoodChoosedData(food)
                        setChooseFood(false);}
                    }>
                    เพิ่มอาหาร
                </div>
            </div>
        </div>

  );
};

export default ChooseFood;