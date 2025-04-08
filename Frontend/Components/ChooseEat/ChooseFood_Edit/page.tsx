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
    const [chooseTime, setChooseTime] = useState<boolean>(false)
    const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0)

    const handleSubmit = () =>{
        if (!food) return
            setFoodChoosedData({
                ...food,
                meal_time: selectedTimeIndex+1, 
            })
        setChooseTime(false)
        setChooseFood(false);
    }
    console.log(food)
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
                    onClick={() => setChooseTime(true)}>
                    เพิ่มอาหาร
                </div>
            </div>

            {chooseTime && 
            
            <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
                <div className="bg-white rounded-2xl p-5 w-80">
                    <div className="text-center font-bold mb-4">เพิ่ม{food.recipe_name}</div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                    {["เช้า", "กลางวัน", "เย็น", "เพิ่มเติม"].map((time, index) => (
                        <div
                            key={time}
                            className={`rounded-lg py-2 text-center font-bold cursor-pointer ${
                              selectedTimeIndex === index ? 'bg-orange300 text-white' : 'bg-sec text-orange300'
                            }`}
                            onClick={() => setSelectedTimeIndex(index)}
                        >
                            {time}
                        </div>
                    ))}
                    </div>

                    <div className="flex justify-between items-center mb-4 gap-x-1">
                        <div className="bg-sec w-1/2 py-2 text-center">1</div>
                        <div className="bg-sec py-2 w-1/2 text-center">จาน</div>
                    </div>

                    <div className="flex justify-between gap-3">
                    <button onClick={() => setChooseTime(false)} className="flex-1 border border-orange300 bg-sec text-orange300 py-2 rounded-lg">
                        ยกเลิก
                    </button>
                    <button onClick={() => handleSubmit()} className="flex-1 bg-orange300 text-white py-2 rounded-lg">
                        เพิ่มอาหาร
                    </button>
                    </div>
                </div>
            </div>
            </>
            }
        </div>

  );
};

export default ChooseFood;