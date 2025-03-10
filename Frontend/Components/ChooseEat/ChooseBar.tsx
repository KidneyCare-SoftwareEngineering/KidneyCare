import React, { useDebugValue, useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MealplanInterface } from "@/Interfaces/FoodInterface";






const ChooseBar: React.FC<{ MealPlans: MealplanInterface, desc: string }> = ({ MealPlans, desc }) => {

    const [eatenItems, setEatenItems] = useState<[]>([]);
    const transition = { type: "spring", stiffness: 200, damping: 20 };

    const containerVariants = {
        visible: { transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition },
        exit: { opacity: 0, y: -20, scale: 0.95, transition },
    };

    const allItems = desc === "ยา" ? MealPlans.medicines : MealPlans.mealplans[0] || [];
    const mealTypes = ["อาหารเช้า", "อาหารกลางวัน", "อาหารเย็น"];


    const handleSelectFood = (food: any) => {
        setEatenItems((prev) => [...prev, food]);
    };

    const handleDeselectFood = (food: any) => {
        setEatenItems((prev) => prev.filter((item) => item !== food));
    };

    return (
        <div className='flex w-full h-full flex-col items-center mt-3'>
            <div className="flex bg-white w-10/12 justify-center items-center rounded-xl drop-shadow-xl mt-6 py-3 text-body2 font-bold">
                {desc}ที่ต้องรับประทาน
            </div>
            <AnimatePresence mode="popLayout">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col w-full items-center"
                >
                    {allItems
                        .filter((data) => !eatenItems.includes(data))
                        .map((data, index) => desc === "ยา" ?
                            (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3"
                                    key={index}>

                                    {/* // เปลี่ยน href ลิงก์ไปยังหน้า detail ยา ด้วยนะ */}
                                    <Link href={`/pilldetail/${data.user_medicine_id}`} className="flex w-4/12 justify-center items-center">
                                        <img src="https://picsum.photos/200/300" className="size-24 rounded-full p-2" />
                                    </Link>
                                    <div className="flex w-6/12 p-2 justify-center flex-col">
                                        <div className="flex text-body3 text-grey300">
                                            เวลา {data.medicine_schedule[0].split("T")[1].slice(0, 5)} น.
                                        </div>
                                        <Link href={`/pilldetail/${data.user_medicine_id}`}
                                            className="flex text-body1 font-bold text-black py-3">
                                            {data.medicine_name}
                                        </Link>
                                        <div className="flex text-body3 text-black">
                                            จำนวน {data.medicine_per_times} {data.medicine_unit}
                                        </div>
                                    </div>
                                    <div onClick={() => handleSelectFood(data)}
                                        className="flex w-2/12 justify-center items-center">
                                        <div className="flex size-6 rounded-full border-2 border-orange300"></div>
                                    </div>
                                </motion.div>
                            ) : (

                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3"
                                    key={index}>
                                    <Link href={`/fooddetail/${data.recipe_id}`} className="flex w-4/12 justify-center items-center">
                                        <img src="https://picsum.photos/200/300" alt="food" className="size-24 rounded-full p-2" />
                                    </Link>
                                    <div className="flex w-6/12 p-2 justify-center flex-col">
                                        <div className="flex text-body3 text-grey300">
                                            {mealTypes[allItems.indexOf(data)]}
                                        </div>
                                        <Link href={`/fooddetail/${data.recipe_id}`}
                                            className="flex text-body1 font-bold text-black py-3 line-clamp-1">
                                            {data.name}
                                        </Link>
                                        <div className="flex text-body3 text-black">
                                            {data.nutrition.calories} <p className="text-grey300"> &nbsp;กิโลแคลอรี่</p>
                                        </div>
                                    </div>
                                    <div onClick={() => handleSelectFood(data)}
                                        className="flex w-2/12 justify-center items-center">
                                        <div className="flex size-6 rounded-full border-2 border-orange300"></div>
                                    </div>
                                </motion.div>

                            )
                        )}
                </motion.div>
            </AnimatePresence>
            {eatenItems.length > 0 && (
                desc === "ยา" ?
                    <div className="flex bg-white w-10/12 justify-center items-center rounded-xl drop-shadow-xl mt-6 py-3 text-body2 font-bold">
                        {desc}ที่รับประทานแล้ว
                    </div>
                    :
                    <div className="flex bg-white w-10/12 justify-between items-center rounded-xl drop-shadow-xl mt-6 py-3 px-5 text-body2 font-bold">
                        <div>{desc}ที่รับประทานแล้ว</div>
                        <div className="flex text-body3">
                            <div className="font-bold"> {eatenItems.reduce((sum, food) => sum + food.nutrition.calories, 0)} </div>
                            <div className="font-bold text-grey300"> &nbsp;/ 2785 แคลอรี่ </div>
                        </div>
                    </div>
            )}

            <AnimatePresence>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col w-full items-center"
                >
                    {eatenItems
                        .map((data, index) => desc === "ยา" ?
                            (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex w-10/12 bg-grey200 border border-grey300 min-h-24 drop-shadow-md rounded-xl mt-3"
                                    key={index}>

                                    {/* // เปลี่ยน href ลิงก์ไปยังหน้า detail ยา ด้วยนะ */}
                                    <Link href={`/pildetail/${data.user_medicine_id}`} className="flex w-4/12 justify-center items-center">
                                        <img src="https://picsum.photos/200/300" className="size-24 rounded-full p-2" />
                                    </Link>
                                    <div className="flex w-6/12 p-2 justify-center flex-col">
                                        <div className="flex text-body3 text-grey300">
                                            เวลา {data.medicine_schedule[0].split("T")[1].slice(0, 5)} น.
                                        </div>
                                        <Link href={`/pildetail/${data.user_medicine_id}`}
                                            className="flex text-body1 font-bold text-black py-3">
                                            {data.medicine_name}
                                        </Link>
                                        <div className="flex text-body3 text-black">
                                            จำนวน {data.medicine_per_times} {data.medicine_unit}
                                        </div>
                                    </div>
                                    <div onClick={() => handleDeselectFood(data)}
                                        className="flex w-2/12 justify-center items-center">
                                        <div className="flex size-6 rounded-full bg-grey500 justify-center items-center">
                                            <Icon icon="material-symbols:check-rounded" className="text-white size-5" />
                                        </div>
                                    </div>
                                </motion.div>

                            ) : (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex w-10/12 bg-grey200 border border-grey300 min-h-24 drop-shadow-md rounded-xl mt-3"
                                    key={index}>
                                    <div className="flex w-4/12 justify-center items-center">
                                        <img src="https://picsum.photos/200/300" alt="food" className="size-24 rounded-full p-2" />
                                    </div>
                                    <div className="flex w-6/12 p-2 justify-center flex-col">
                                        <div className="flex text-body3 text-grey300">
                                            {mealTypes[allItems.indexOf(data)]}
                                        </div>
                                        <div className="flex text-body1 font-bold text-black py-3">
                                            {data.name}
                                        </div>
                                        <div className="flex text-body3 text-black">
                                            {data.nutrition.calories} <p className="text-grey300"> &nbsp;กิโลแคลอรี่</p>
                                        </div>
                                    </div>
                                    <div onClick={() => handleDeselectFood(data)}
                                        className="flex w-2/12 justify-center items-center">
                                        <div className="flex size-6 rounded-full bg-grey500 justify-center items-center">
                                            <Icon icon="material-symbols:check-rounded" className="text-white size-5" />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        )}
                </motion.div>
            </AnimatePresence>


        </div>



    );
};

export default ChooseBar;