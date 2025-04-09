'use client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import StatePage1 from './StatePage1'
import TitleBar from '@/Components/TitleBar'
import Dropdown from '@/Components/Dropdown'
import StatePage2 from './StatePage2'
import { MealplanInterface } from '@/Interfaces/Meal_PillInterface'
import PuffLoader from "react-spinners/PuffLoader";
import { ScatterBoxLoader } from "react-awesome-loaders";



export default function CreatePlan() {
  const { id } = useParams();
  const userUid = id;
  const [selectedOption, setSelectedOption] = useState("เลือกระยะเวลา");
  const [selectedValue, setSelectedValue] = useState<number>(0);
  const [statePage, setStatePage] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [mealPlan, setMealPlan] = useState<MealplanInterface>({
    mealplans: [],
    userUid: "",
  });
  const [dayIndex, setDayIndex] = useState<number>(0);

  

  const SendToMealPlan = {
    data: {
      u_id: userUid,
      days: selectedValue
    }
  };

  const handleGenMealPlan = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meal_plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(SendToMealPlan),
      });
      const data = await response.json();
      setMealPlan(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false)
      setStatePage(1);
    }
  };

  if (isLoading) 
    return (
        <div className="flex w-screen h-screen flex-col justify-center items-center bg-sec"> 
            {/* <PuffLoader size={60} color="#FF5733" /> */}
            {/* <p className="mt-4 text-lg font-bold text-orange300 animate-pulse">กำลังสร้างแผนมื้ออาหาร</p> */}
            {/* <PuffLoader
              size={60}
            /> */}
            <ScatterBoxLoader
            primaryColor={"#FF7E2E"}
            background={"#FAF5EF"}
      />
        </div>
      )
  
  return (
    <>  
      {statePage === 0 && 
        <div className="flex relative flex-col w-full h-full min-h-screen bg-sec items-center">
            <TitleBar title="ระยะเวลาในการวางแผน" href="/mealplan"/>

              <p className='text-body1 font-bold pt-16'>เลือกระยะเวลาที่ท่านต้องการวางแผนมื้ออาหาร</p>

              <Dropdown 
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption} 
                setSelectedValue={setSelectedValue}
              />
              {
                selectedValue === 0 ? null 
                :
                <div 
                  onClick={() =>  handleGenMealPlan() }
                  className="flex absolute w-10/12  h-14 bottom-24 bg-orange300 font-bold text-body1 text-white rounded-xl justify-center items-center">
                    สร้างแผนมื้ออาหาร
                </div>
              }
        </div>
      }

      {statePage === 1 &&  <StatePage1 
                            setStatePage={setStatePage} 
                            statePage={statePage} 
                            mealPlan={mealPlan}
                            setDayIndex={setDayIndex}
                            selectedValue={selectedValue}
                            userUid={userUid}
                            />}

      {statePage === 2 && <StatePage2
                            setStatePage={setStatePage} 
                            selectedValue={selectedValue}
                            statePage={statePage} 
                            mealPlan={mealPlan}
                            setMealPlan={setMealPlan}
                            dayIndex={dayIndex}
                            userUid={userUid}
                            />}
    </>
  )
}

