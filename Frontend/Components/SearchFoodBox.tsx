'use client'
import Link from "next/link"
import { useState, useRef, useEffect} from "react";
import {FoodInterface} from "@/Interfaces/Meal_PillInterface"

const SearchFoodBox: React.FC<{food:FoodInterface; isEdit?:boolean; setChooseFood?: (id: number) => void;}> = ({food, isEdit, setChooseFood}) => {

    const [imageUrl, setImageUrl] = useState("");
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setImageUrl(food.image_url[0]); 
                    observer.disconnect(); 
                }
            },
            { rootMargin: "0px" } 
        );

        if (imageRef.current) observer.observe(imageRef.current);
        return () => observer.disconnect();
    }, [food.image_url]);

    console.log("ง่วง", food)


    return(
        <>
            {isEdit ? 
            (
                <div
                onClick={() => setChooseFood && setChooseFood(food.id)}
                data-testid="food-card"
                className="flex justify-center rounded-xl bg-white w-11/12 h-full drop-shadow-lg  p-2">
    
                    <div 
                        ref={imageRef}
                        className="flex w-2/5 rounded-xl"
                        style={{
                            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                            backgroundSize: "cover", 
                            backgroundRepeat: "no-repeat", 
                            backgroundPosition: "center", 
                        }}
                    />
                    <div className="flex w-3/5 h-full flex-col p-2"> 
                        <div className="flex w-full justify-between items-center mb-2">
                            <div className="justify-start text-body1 font-extrabold">{food.recipe_name}</div>
                            <div className="justify-end text-searchcalories text-body3 font-extrabold">{food.calories} แคลอรี่</div>
                        </div>
    
                        {/* โปรตีน */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">โปรตีน</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.protein}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* คาร์โบ */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">คาร์โบไฮเดรต</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.carbs}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* ไขมัน */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">ไขมัน</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.fat}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* โซเดียม */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">โซเดียม</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.sodium}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* ฟอสฟอรัส */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">ฟอสฟอรัส</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.phosphorus}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* โพแทสเซียม */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">โพแทสเซียม</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.potassium}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            )
            :
            (
            <Link 
                href={`/fooddetail/${food.id}`}
                data-testid="food-card"
                className="flex justify-center rounded-xl bg-white w-11/12 h-full drop-shadow-lg  p-2">
    
                    <div 
                        ref={imageRef}
                        className="flex w-2/5 rounded-xl"
                        style={{
                            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                            backgroundSize: "cover", 
                            backgroundRepeat: "no-repeat", 
                            backgroundPosition: "center", 
                        }}
                    />
                    <div className="flex w-3/5 h-full flex-col p-2"> 
                        <div className="flex w-full justify-between items-center mb-2">
                            <div className="justify-start text-body1 font-extrabold">{food.recipe_name}</div>
                            <div className="justify-end text-searchcalories text-body3 font-extrabold">{food.calories} แคลอรี่</div>
                        </div>
    
                        {/* โปรตีน */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">โปรตีน</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.protein}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* คาร์โบ */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">คาร์โบไฮเดรต</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.carbs}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* ไขมัน */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">ไขมัน</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.fat}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* โซเดียม */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">โซเดียม</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.sodium}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* ฟอสฟอรัส */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">ฟอสฟอรัส</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.phosphorus}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
    
                        {/* โพแทสเซียม */}
                        <div className="flex w-full justify-center items-center">
                            <div className="flex w-4/5 h-full text-body3 text-orange400">โพแทสเซียม</div>
                            <div className="flex w-1/5 h-full justify-end">
                                <p className="text-black text-body3">{food.potassium}</p>
                                <p className="text-gray300 text-body3 ml-1"> ก. </p>
                            </div>
                        </div>
                        
                    </div>
                </Link>
            )}


           
            
        </>
    )
}
export default SearchFoodBox