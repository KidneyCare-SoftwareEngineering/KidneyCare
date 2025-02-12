'use client'
import DateSlider from '@/Components/DateSlider'
import Navbar from '@/Components/Navbar'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import React from 'react'

export default function MealPlan() {
  return (
    <>  
        <div className="flex reltive flex-col w-full h-full min-h-screen bg-sec items-center">
            <Navbar/>
            <DateSlider onDateSelect={(date) => console.log('Selected date:', date)} />
            <img src='NoFood.png' className='size-48 mt-32'/>
            <div className="text-heading3 mt-8">
                ยังไม่มีการวางแผนมื้ออาหาร
            </div>
            <Link 
            href="/mealplan/createplan"
            className="flex absolute size-12 bg-orange300 rounded-full right-3 bottom-6 justify-center items-center cursor-pointer"
            >
                <Icon icon="ic:baseline-plus" height="32" className="text-white"/>
            </Link>

        </div>

    </>
  )
}
