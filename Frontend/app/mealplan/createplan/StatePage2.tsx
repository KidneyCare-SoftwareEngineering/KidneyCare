import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import TitleBarStatePage from '@/Components/TitleBarStatePage'
import statePage from '@/Interfaces/StatePage'
import { MealplanInterface }  from '@/Interfaces/FoodInterface'


const StatePage2 : React.FC<Pick<statePage, 'setStatePage' | 'statePage' | 'dayIndex'> & MealplanInterface> = ({
  setStatePage, 
  statePage, 
  mealPlan, 
  dayIndex
}) => {
  const [selectedMenu, setSelectedMenu] = useState<number[]>([]);

  

  const toggleSelectMenu = (index: number) => {
    setSelectedMenu((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    )
  }

  const prepareDataForBackend = () => {
    const updatedMealplans = JSON.parse(JSON.stringify(mealPlan))
    selectedMenu.forEach(index => {
      updatedMealplans.mealplans[dayIndex].meals[index] = {}
    })
    
    return updatedMealplans
  }

  const handleSubmit = () => {
    const dataToSend = prepareDataForBackend()
    console.log("Data to send to backend:", dataToSend.mealplans[dayIndex])
    // async fetch 
  }

  // useEffect(() => {
  //   console.log("เมนูที่เลือกลบ", selectedMenu)
  //   console.log("mealplans",mealPlan.mealplans[0].meals)
  // })

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


        {mealPlan.mealplans[dayIndex].meals.map((data, index) => {
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
                  <div
                    className="flex w-2/5 rounded-xl"
                    style={{
                      backgroundImage: `url(${data.image_url})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  />

                  <div className="flex flex-col h-full w-full justify-around py-3">
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
          <div className="flex w-screen justify-center">
            <button
              onClick={handleSubmit}
              className="fixed bottom-24 w-10/12 bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
            >
              สร้างใหม่
            </button>

            <button
              onClick={handleSubmit}
              className="fixed bottom-6 w-10/12 bg-sec border border-orange300 text-orange300 py-4 rounded-xl text-body1 font-bold"
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