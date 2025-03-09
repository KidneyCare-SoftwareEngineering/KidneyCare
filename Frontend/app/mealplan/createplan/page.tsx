import React from 'react'
import { StatePage1 } from './StatePage1'
import TitleBar from '@/Components/TitleBar'
import Dropdown from '@/Components/Dropdown'

export default function CreatePlan() {
  return (
    <>
        <div className="flex flex-col w-full h-full min-h-screen bg-sec items-center">
            <TitleBar title="ระยะเวลาในการวางแผน" href="/MealPlan"/>
            <div className="flex w-full h-full text-body1 font-bold justify-center items-center mt-14 flex-col">
                เลือกระยะเวลาที่ท่านต้องการวางแผนมื้ออาหาร
                <Dropdown/>
            </div>
        </div>
    </>
  )
}

