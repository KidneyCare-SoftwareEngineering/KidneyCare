'use client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import StatePage1 from './StatePage1'
import TitleBar from '@/Components/TitleBar'
import Dropdown from '@/Components/Dropdown'
import StatePage2 from './StatePage2'
import { MealplanInterface } from '@/Interfaces/FoodInterface'


export default function CreatePlan() {
  const [selectedOption, setSelectedOption] = useState("เลือกระยะเวลา");
  const [selectedValue, setSelectedValue] = useState<number>(0);
  const [statePage, setStatePage] = useState<number>(0);
  const [mealPlan, setMealPlan] = useState<MealplanInterface>({
    mealplans: [],
    user_line_id: "",
  });
  const [dayIndex, setDayIndex] = useState(0);

  const u_id =  "U12345678901"

  const SendToMealPlan = {
    data: {
      u_id: u_id,
      days: selectedValue
    }
  };

  const handleGenMealPlan = async () => {
    try {
      const response = await fetch('http://127.0.0.1:7878/meal_plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(SendToMealPlan),
      });
      const data = await response.json();
      setMealPlan(data);
      setStatePage(1);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
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
                            setDayIndex={setDayIndex}/>}

      {statePage === 2 && <StatePage2
                            setStatePage={setStatePage} 
                            selectedValue={selectedValue}
                            statePage={statePage} 
                            mealPlan={mealPlan}
                            setMealPlan={setMealPlan}
                            dayIndex={dayIndex}/>}
    </>
  )
}

