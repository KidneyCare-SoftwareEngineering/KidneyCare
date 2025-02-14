'use client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import StatePage1 from './StatePage1'
import TitleBar from '@/Components/TitleBar'
import Dropdown from '@/Components/Dropdown'
import StatePage2 from './StatePage2'



export default function CreatePlan() {
  const [selectedOption, setSelectedOption] = useState("เลือกระยะเวลา");
  const [selectedValue, setSelectedValue] = useState(0);
  const [statePage, setStatePage] = useState(0);
  const [mealPlan, setMealPlan] = useState([]);
  const [dayIndex, setDayIndex] = useState(0);

  const u_id ="mfkidsmomwlknwe"

  const SendToMealPlan = {
    data: {
      u_id: u_id,
      days: selectedValue
    }
  };

  const handleGenMealPlan = async() => {
    await fetch('http://127.0.0.1:7878/meal_plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SendToMealPlan),
    })
    .then(response => response.json())
    .then(data => {
      setMealPlan(data)
      setStatePage(1)
    })
    .catch(error => console.error('Error:', error));
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

      {statePage === 1 && <StatePage1 
                            setStatePage={setStatePage} 
                            statePage={statePage} 
                            mealPlan={mealPlan}
                            dayIndex={dayIndex}
                            setDayIndex={setDayIndex}/>}

      {statePage === 2 && <StatePage2
                            setStatePage={setStatePage} 
                            statePage={statePage} 
                            mealPlan={mealPlan}
                            dayIndex={dayIndex}/>}
    </>
  )
}

