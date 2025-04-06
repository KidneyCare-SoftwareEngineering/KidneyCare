'use client'
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import TitleBarStatePage from '@/Components/TitleBarStatePage'
import { MealplanInterface }  from '@/Interfaces/Meal_PillInterface'
import { StatePage2Props } from '@/Interfaces/StatePage'
import PuffLoader from 'react-spinners/PuffLoader'


const StatePage2 : React.FC<StatePage2Props> = ({
  setStatePage, 
  statePage, 
  mealPlan, 
  dayIndex = 0,
  selectedValue,
  setMealPlan,
  userUid
}) => {
  const [selectedMenu, setSelectedMenu] = useState<number[]>([])
  const updatedMealplans = JSON.parse(JSON.stringify(mealPlan))
  const [newMealplans, setNewMealplans] = useState<MealplanInterface | Record<string, never>>({})
  const [isLoading, setIsLoading] = useState(false)
  

  const toggleSelectMenu = (index: number) => {
    setSelectedMenu((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    )
  }



  const dataforupdateAPI = {
    user_id: userUid,
    days : selectedValue,
    mealplans : updatedMealplans.mealplans
  }

  const handleCreateNewMealplans = async () => {

    await fetch (`${process.env.NEXT_PUBLIC_API_URL}/update_meal_plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataforupdateAPI),
    })
    .then(response => response.json())
    .then(data => {
      setNewMealplans(data)
      
    })
    .catch(error => console.error('Error:', error));
  }

  const handleSubmit = () => {
    if (!newMealplans || !('mealplans' in newMealplans) || Object.keys(newMealplans).length === 0) return;
    
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));
    if (newMealplans.mealplans && dayIndex !== undefined) {
      updatedMealPlan.mealplans[dayIndex] = newMealplans.mealplans[dayIndex];
    }
    
    if (setMealPlan) { 
      setMealPlan(updatedMealPlan);
    }
    
    setSelectedMenu([]);
    setNewMealplans({});
  };

  useEffect(() => {
    selectedMenu.forEach(index => {
      updatedMealplans.mealplans[dayIndex][index] = {}
    })
  },[selectedMenu])

  useEffect(() => {
    console.log(mealPlan)
  },[mealPlan])


  return (
    <>
      <div className="flex w-full h-screen flex-col  items-center bg-sec">
        <TitleBarStatePage title="รายการอาหารของคุณ" statePage={statePage} setStatePage={setStatePage}/>

        <div className="flex w-11/12 text-heading4 font-bold mt-16">
            วันจันทร์ที่ 9 ธันวาคม 2567
        </div>
        <div className="flex w-11/12 text-body2 text-grey300 mt-4">
            หากท่านไม่พอใจกับรายการที่มีอยู่ ท่านสามารถเลือกรายการที่ต้องการแก้ไขและคำการสร้างแผนใหม่ได้
        </div>


        {(newMealplans?.mealplans?.[dayIndex] ?? mealPlan.mealplans?.[dayIndex] ?? []).map((data, index) => {
            const isSelected = selectedMenu.includes(index); 
            return (
              <div
                key={index}
                className={`flex w-11/12 h-28 rounded-xl drop-shadow-xl mt-6 px-4 cursor-pointer transition-all ${
                  isSelected ? "bg-fillstrock border border-orange300" : "bg-white"
                }`}
                onClick={() => toggleSelectMenu(index)}
              >
                <div className="flex w-11/12 justify-start items-center text-body1 font-bold">
                  <div className="flex justify-center items-center w-4/12">
                    <img src={`${data.recipe_img_link[0]}`} alt="food" className="size-24 rounded-full p-2"/>
                  </div>

                  <div className="flex flex-col h-full justify-around py-3 ml-2">
                    <div className="flex text-body3 text-grey300">
                      {index === 0 ? "อาหารเช้า" : index === 1 ? "อาหารกลางวัน" : "อาหารเย็น"}
                    </div>

                    <div className="flex text-body1 font-bold">{data.name}</div>

                    <div className="flex text-body3">
                      {data.nutrition.calories}
                      <p className="text-body3 text-grey300">&nbsp;แคลอรี่</p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        }

        {selectedMenu.length > 0 && (
          <div className="flex flex-col w-screen justify-center items-center my-8 gap-3">


            {Object.keys(newMealplans).length === 0  ? (
              isLoading ? (
                <button
                  onClick={handleCreateNewMealplans}
                  className="flex bottom-24 w-10/12 justify-center items-center bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
                >
                  <PuffLoader />
                </button>
                ) 
                :
                (
                <button
                  onClick={handleCreateNewMealplans}
                  className="flex bottom-24 w-10/12 justify-center items-center bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
                >
                  สร้างใหม่
                </button>
                )
              ) 
              : 
              (
              <button
                onClick={handleSubmit}
                className="flex bottom-24 w-10/12 justify-center items-center bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
              >
                บันทึก
              </button>
              )
            }
            

            <button
              onClick={() => {
                setSelectedMenu([])
                setNewMealplans({})
              }}
              className="flex bottom-6 w-10/12 justify-center items-center bg-sec border border-orange300 text-orange300 py-4 rounded-xl text-body1 font-bold"
            >
              ยกเลิก
            </button>
          </div>
        )}

      </div>
    </>
  )
}

export default StatePage2