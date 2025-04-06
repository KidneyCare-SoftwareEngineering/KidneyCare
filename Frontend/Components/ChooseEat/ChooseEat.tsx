'use client'
import React, { useEffect } from "react";
import { MedicineData } from "@/Interfaces/Meal_PillInterface";
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import ChooseBar from "./ChooseBar";
import { Meal_planInterface } from "@/Interfaces/Meal_PillInterface";

const ChooseEat: React.FC<{ dateSelected?: Date, desc: string, MealPlans: Meal_planInterface, isEdit: boolean, setIsEdit: React.Dispatch<React.SetStateAction<boolean>>, userUid: string; setIsLoading: (value: boolean) => void;}> = ({ dateSelected, desc, MealPlans, isEdit, setIsEdit, userUid, setIsLoading}) => {
  
  return (
    <div className='flex w-full h-full flex-col items-center pt-12'>
      <div className="flex w-full text-heading4 text-black font-bold px-12">
        วัน
        {dateSelected ? format(dateSelected, "EEEEที่ d MMMM", { locale: th }) + ` ${dateSelected.getFullYear() + 543}` : <></>}
      </div>
      <div className="flex w-full text-body2 text-grey300 font-bold px-12 mt-2">
        เลือกเพื่อบันทึกรายการ{desc}นี้ได้รับประทานเรียบร้อยแล้ว
      </div>

      {desc === "ยา" ? 
      (
        // รอยา
        <ChooseBar MealPlans={MealPlans} 
          desc={desc} 
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          userUid={userUid}
          setIsLoading={setIsLoading}/>

      ): (
        <ChooseBar MealPlans={MealPlans as Meal_planInterface}
          desc={desc} 
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          userUid={userUid}
          setIsLoading={setIsLoading}/>
      )}
    </div>

  );
};

export default ChooseEat;