'use client'
import DateSlider from '@/Components/DateSlider'
import Navbar from '@/Components/Navbar'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import React, { useState } from 'react'
import ChooseEat from '@/Components/ChooseEat/ChooseEat'
import { is } from 'date-fns/locale'
import { motion } from 'framer-motion'

export default function MealPlan() {
  const [dateSelected, setDateSelected] = useState<Date>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const MealPlans = {
    // "mealplans": [
    //     [
    //         {
    //             "name": "ลาบไก่",
    //             "nutrition": {
    //                 "calories": 4172.0,
    //                 "carbs": 4172.0,
    //                 "fat": 4172.0,
    //                 "phosphorus": 4172.0,
    //                 "potassium": 4172.0,
    //                 "protein": 4172.0,
    //                 "sodium": 4172.0
    //             },
    //             "recipe_id": "5"
    //         },
    //         {
    //             "name": "เงาะลอยแก้ว",
    //             "nutrition": {
    //                 "calories": 1185.5,
    //                 "carbs": 1185.5,
    //                 "fat": 1185.5,
    //                 "phosphorus": 1185.5,
    //                 "potassium": 1185.5,
    //                 "protein": 1185.5,
    //                 "sodium": 1185.5
    //             },
    //             "recipe_id": "4"
    //         },
    //         {
    //             "name": "ข้าวเหนียวหมูพริกไทยดำ",
    //             "nutrition": {
    //                 "calories": 591,
    //                 "carbs": 120,
    //                 "fat": 34,
    //                 "phosphorus": 540,
    //                 "potassium": 700,
    //                 "protein": 27,
    //                 "sodium": 550
    //             },
    //             "recipe_id": "24"
    //         }
    //     ]
    // ],
    // "user_line_id": "U12345678901"
}


    return (
        <>
            <div className="flex reltive flex-col w-full h-full pb-8 min-h-screen bg-sec items-center">
                <Navbar />
                <DateSlider onDateSelect={(date) => setDateSelected(date)} />


            {MealPlans ? (
              <>
                <img src='NoFood.png' className='size-48 mt-32'/>
                <div className="text-heading3 mt-8">
                    ยังไม่มีการวางแผนมื้ออาหาร
                </div>
              </>
            )
            :  
            (
              <ChooseEat  dateSelected = {dateSelected}
                          desc = "อาหาร"
                          MealPlans = {MealPlans}
              />
            )
            }


            {MealPlans ? (
                <Link 
                href="/mealplan/createplan"
                className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                >
                <Icon icon="ic:baseline-plus" height="32" className="text-white"/>
                </Link>
            ) : 
            (
                <>
                    {isMenuOpen ? (
                        <div 
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed bg-gradient-to-tl from-white to-transparent right-0 bottom-0 w-full h-full">
                            <motion.div
                                onClick={() => setIsMenuOpen(false)}
                                className="fixed size-12 bg-white border border-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 45 }} 
                                exit={{ rotate: 0 }} 
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Icon icon="ic:baseline-plus" height="32" className="text-orange300"/>
                            </motion.div>
                            
                            <div 
                                onClick={() => console.log("edit")}
                                className="fixed">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -20 }} 
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="fixed size-12 right-16 bottom-20 flex justify-center items-center"
                                >
                                    แก้ไข
                                </motion.div>
                                <motion.div
                                    className="fixed size-12 bg-orange300 rounded-full right-3 bottom-20 flex justify-center items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -20 }} 
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Icon icon="ic:sharp-edit" height="20" className="text-white"/>
                                </motion.div>
                            </div>

                            <Link
                                href={`/mealplan/createplan`} 
                                className="fixed">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -20 }} 
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="fixed  right-32 bottom-9 flex justify-center items-center"
                                >
                                    สร้างแผน
                                </motion.div>
                                <motion.div
                                    className="fixed size-12 bg-orange300 rounded-full right-16 bottom-6 flex justify-center items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -20 }} 
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Icon icon="iconoir:book" height="28" className="text-white"/>
                                </motion.div>
                            </Link>
                        </div>
                    </>
                )
                    :
                    (
                        <ChooseEat dateSelected={dateSelected}
                            desc="ยา"
                            MealPlans={pill}
                        />
                    )
                }


                {!MealPlans ? (
                    <Link
                        href="/mealplan/createplan"
                        className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                    >
                        <Icon icon="ic:baseline-plus" height="32" className="text-white" />
                    </Link>
                ) :
                    (
                        <>
                            {isMenuOpen ? (
                                <div
                                    onClick={() => setIsMenuOpen(false)}
                                    className="fixed bg-gradient-to-tl from-white to-transparent right-0 bottom-0 w-full h-full">
                                    <motion.div
                                        onClick={() => setIsMenuOpen(false)}
                                        className="fixed size-12 bg-white border border-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 45 }}
                                        exit={{ rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Icon icon="ic:baseline-plus" height="32" className="text-orange300" />
                                    </motion.div>

                                    <div
                                        onClick={() => console.log("edit")}
                                        className="fixed">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="fixed size-12 right-16 bottom-20 flex justify-center items-center"
                                        >
                                            แก้ไข
                                        </motion.div>
                                        <motion.div
                                            className="fixed size-12 bg-orange300 rounded-full right-3 bottom-20 flex justify-center items-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Icon icon="ic:sharp-edit" height="20" className="text-white" />
                                        </motion.div>
                                    </div>

                                    <Link
                                        href={`/mealplan/createplan`}
                                        className="fixed">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="fixed  right-32 bottom-9 flex justify-center items-center"
                                        >
                                            สร้างแผน
                                        </motion.div>
                                        <motion.div
                                            className="fixed size-12 bg-orange300 rounded-full right-16 bottom-6 flex justify-center items-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Icon icon="ic:sharp-edit" height="20" className="text-white" />
                                        </motion.div>
                                    </Link>
                                </div>

                            ) : (
                                <motion.div
                                    onClick={() => setIsMenuOpen(true)}
                                    className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 0 }}
                                    exit={{ rotate: -45 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Icon icon="ic:baseline-plus" height="32" className="text-white" />
                                </motion.div>
                            )}

                        </>
                    )
                }


            </div>

        </>
    )
}
