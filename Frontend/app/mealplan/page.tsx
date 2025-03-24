'use client'
import DateSlider from '@/Components/DateSlider'
import Navbar from '@/Components/Navbar'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import React, {useEffect, useState} from 'react'
import ChooseEat from '@/Components/ChooseEat/ChooseEat'
import { motion, AnimatePresence } from 'framer-motion'
import PuffLoader from "react-spinners/PuffLoader";

export default function MealPlan() {
  const [dateSelected, setDateSelected] = useState<Date>()
  const formattedDate = dateSelected?.toISOString().split("T")[0] + "T12:00:00";
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mealPlans, setMealPlans] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false);

  const user_line_id = "U12345678902";

  const SendToGet_Meal_Plan = {
    user_line_id: user_line_id,
    date: formattedDate
  }

  useEffect(() => {
      const get_meal_plan = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('http://127.0.0.1:7878/get_meal_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(SendToGet_Meal_Plan),
                });
                const data = await response.json();
                setMealPlans(data);
        } catch (error) {
            console.log("error", error)
        } finally{
            setIsLoading(false)
        }
        
      }; 
      get_meal_plan()
    }, [formattedDate, dateSelected]);


  return (
    <>  
        <div className="flex reltive flex-col w-full h-full pb-8 min-h-screen bg-sec items-center">
            <Navbar/>
            <DateSlider onDateSelect={(date) => setDateSelected(date)} />

            {isLoading ? (
                <div className='flex w-screen h-screen justify-center items-start pt-8'> 
                    <PuffLoader /> 
                </div>
                ) : !mealPlans?.meal_plans || mealPlans.meal_plans.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}  
                        animate={{ opacity: 1}}   
                        exit={{ opacity: 0}}     
                        transition={{ duration: 0.3 }}
                        className='flex flex-col w-full h-full justify-center items-center' >
                        <img src='NoFood.png' className='size-48 mt-32'/>
                        <div className="text-heading3 mt-8">
                            ยังไม่มีการวางแผนมื้ออาหาร
                        </div>
                    </motion.div>
                ) : (
                    <ChooseEat dateSelected={dateSelected} desc="อาหาร" MealPlans={mealPlans} />
                )
            }
            


            {!mealPlans?.meal_plans || mealPlans.meal_plans.length === 0 ? (
                    <Link 
                    href="/mealplan/createplan"
                    className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                    >
                        <Icon icon="ic:baseline-plus" height="32" className="text-white"/>
                    </Link>
            ) : 
            (
                <AnimatePresence>
                    {isMenuOpen ? (
                        <motion.div 
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
                        </motion.div>

                    ) : (
                        <motion.div
                            onClick={() => setIsMenuOpen(true)}
                            className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 0 }} 
                            exit={{ rotate: 45 }} 
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Icon icon="ic:baseline-plus" height="32" className="text-white"/>
                        </motion.div>
                    )}
                    
                </AnimatePresence>
            )
            }
            

        </div>

    </>
  )
}
