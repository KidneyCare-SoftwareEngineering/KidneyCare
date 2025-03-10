import React, { useEffect } from "react";
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import ChooseBar from "./ChooseBar";

const ChooseEat: React.FC<{ dateSelected?: Date, desc: string, MealPlans: any }> = ({ dateSelected, desc, MealPlans }) => {
  useEffect(() => {
    console.log(MealPlans)
  })
  return (
    <div className='flex w-full h-full flex-col items-center pt-12'>
      <div className="flex w-full text-heading4 text-black font-bold px-12">
        วัน
        {dateSelected ? format(dateSelected, "EEEEที่ d MMMM", { locale: th }) + ` ${dateSelected.getFullYear() + 543}` : <></>}
      </div>
      <div className="flex w-full text-body2 text-grey300 font-bold px-12 mt-2">
        เลือกเพื่อบันทึกรายการ{desc}นี้ได้รับประทานเรียบร้อยแล้ว
      </div>

      <ChooseBar MealPlans={MealPlans}
        desc={desc} />
    </div>

  );
};

export default ChooseEat;