"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";

export default function CalendarSide({ onDateSelect }) {
  const [selectDate, setSelectDate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentDate] = useState(new Date());

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const getBuddhistYear = (date) => {
    return date.getFullYear() + 543;
  };

  useEffect(() => {
    // Optionally update other things when selectDate changes
  }, [selectDate]);

  const handleDateClick = (date) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSelectDate(date);
      onDateSelect(date);
      setIsAnimating(false);
    }, 300);
  };

  const isSelect = (date) => {
    return date.toDateString() === selectDate.toDateString();
  };

  const isCurrentDate = (date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  const handlePrev = () => {
    if (isAnimating) return;
    const prevDate = new Date(selectDate);
    prevDate.setDate(selectDate.getDate() - 1);
    setSelectDate(prevDate);
  };

  const handleNext = () => {
    if (isAnimating) return;
    const nextDate = new Date(selectDate);
    nextDate.setDate(selectDate.getDate() + 1);
    setSelectDate(nextDate);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* ปฏิทิน */}
      <div className="flex items-center py-4">
        {/* ปุ่มย้อนกลับ */}
        <button onClick={handlePrev} className="mx-12">
          <Icon icon="ep:arrow-left" className="h-6 w-6 text-black" />
        </button>

        {/* แสดงวันที่ */}
        <div className="flex flex-col items-center mx-4">
          <div className="text-lg font-bold">
            {selectDate.getDate()} {months[selectDate.getMonth()]}{" "}
            {getBuddhistYear(selectDate)}
          </div>
        </div>

        {/* ปุ่มเลื่อนขวา */}
        <button onClick={handleNext} className="mx-12">
          <Icon icon="ep:arrow-right" className="h-6 w-6 text-black" />
        </button>
      </div>
    </div>
  );
}
