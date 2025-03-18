'use client'
import React, { useState, useEffect } from 'react';

interface DateSliderProps {
    onDateSelect: (date: Date) => void;
  }

export default function DateSlider({ onDateSelect }: DateSliderProps) {
    
    const [selectDate, setSelectDate] = useState<Date>(new Date())
    const [dateRange, setDateRange] = useState<Date[]>([])
    const [isAnimating, setIsAnimating] = useState(false)
    const [currentDate] = useState<Date>(new Date()) 

    const Days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    useEffect(() => {
        updateDateRange(selectDate)
    }, [selectDate])

    useEffect(() => {
        onDateSelect(selectDate) 
    }, [])

    const updateDateRange = (centerDate: Date) => {
        const dates = []
        for (let i = -3; i <= 3; i++) {
            const date = new Date(centerDate)
            date.setDate(centerDate.getDate() + i)
            dates.push(date)
        }
        setDateRange(dates)
    }

    const handleDateClick = (date: Date) => {
        if (isAnimating) return
        setIsAnimating(true)
        setTimeout(() => {
            setSelectDate(date)
            onDateSelect(date);
            setIsAnimating(false)
        }, 300)
    }

    const isSelect = (date: Date) => {
        return date.toDateString() === selectDate.toDateString()
    }

    const isCurrentDate = (date: Date) => {
        return date.toDateString() === currentDate.toDateString()
    }
    return(
        <>
            <div className="flex w-full h-50 bg-white  justify-center items-center py-4">
            {dateRange.map((date, index) => (
                <div
                    key={date.toISOString()}
                    className={`flex size-16 flex-col justify-center items-center cursor-pointer
                    transition-all duration-300 ease-in-out
                    ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
                    onClick={() => handleDateClick(date)}
                >

                    <div className="text-grey300 text-body3">
                    {Days[date.getDay()]}
                    </div>

                    <div
                    className={`flex justify-center items-center mt-1 rounded-full
                        transition-all duration-300 ease-in-out
                        ${isSelect(date) 
                        ? 'size-10 bg-orange300 text-white font-bold text-body1' 
                        : 'size-8 bg-sec text-grey300 text-body3'}
                        ${isCurrentDate(date) 
                        ? 'border-2 border-orange300' 
                        : ''}`}
                    >

                    {date.getDate()}
                    
                    </div>
                </div>
            ))}
                
            </div>
        </>
    )
}
