import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import TitleBarStatePage from '@/Components/TitleBarStatePage'
import statePage from '@/Interfaces/StatePage'
import { MealplanInterface }  from '@/Interfaces/FoodInterface'


const StatePage1 : React.FC<statePage & MealplanInterface > = ({setStatePage, statePage, mealPlan, setDayIndex}) => {
    
    return (
    <>
        <div className="flex w-full h-screen flex-col items-center  bg-sec">
            <TitleBarStatePage title="รายการอาหารของคุณ" statePage={statePage} setStatePage={setStatePage}/>
            
            {mealPlan.mealplans.map((data,index) => (
                <div 
                    key={index} 
                    onClick={() => {
                      setStatePage(2)
                      setDayIndex(index)
                    }}
                    className="flex w-11/12 h-14 rounded-xl drop-shadow-xl bg-white mt-6 px-4"> 
                    <div className="flex w-11/12 justify-start items-center text-body1 font-bold "> 
                        วันที่ {index+1}
                    </div>
                    <div className="flex w-1/12 justify-center items-center">
                        <Icon icon="weui:arrow-filled" height="24px"/>
                    </div>
                </div>
            ))}
            

            <div className="flex w-11/12 h-14 rounded-xl drop-shadow-xl bg-white mt-6 px-4 "> 
                <div className="flex w-11/12 animate-pulse justify-start items-center text-body1 font-bold"> 
                    
                <div className="flex bg-slate-300 rounded-full size-8 mr-4"/>
                    <div className="flex bg-slate-300 rounded-full w-8/12 h-2">
                    </div>
                </div>
                <div className="flex w-1/12 animate-pulse justify-center items-center">
                    <Icon icon="weui:arrow-filled" height="24px"/>
                </div>
            </div>
        </div>
    </>
  )
}

export default StatePage1