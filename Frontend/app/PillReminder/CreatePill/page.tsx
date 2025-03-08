"use client";

import React, { useState } from "react";
import TitleBar from "@/Components/TitleBar";
import { FiPlus, FiMinus, FiTrash, FiX } from "react-icons/fi";
import TimeInputPopup from "@/Components/TimeInputPopup";

export default function CreatePlan() {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [medName, setMedName] = useState<string>("");
  const [totalPills, setTotalPills] = useState<string>("");
  const [dose, setDose] = useState<number>(0);
  const [times, setTimes] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [note, setNote] = useState<string>("");
  const [newTime, setNewTime] = useState("");

  interface PillReminder {
    medName: string;
    totalPills: string;
    dose: number;
    times: string[];
    images: File[];
    note: string;
  }

  // ฟังก์ชันเพิ่มเวลา
  const addTime = (time: string) => {
    if (time && !times.includes(time)) {  // ตรวจสอบว่าเวลานั้นยังไม่อยู่ใน times
      setTimes([...times, time]);
    } else {
      console.log("⚠️ เวลานี้ถูกเพิ่มไปแล้ว");
    }
    setNewTime("");  // ล้างค่าหลังจากเพิ่ม
  };

  // ฟังก์ชันลบเวลา
  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  // การเรียงลำดับเวลา
  const sortedTimes = times.sort((a, b) => {
    const [hourA, minuteA] = a.split(":").map(Number);
    const [hourB, minuteB] = b.split(":").map(Number);
    
    if (hourA === hourB) {
      return minuteA - minuteB;
    }
    return hourA - hourB;
  });


  // ฟังก์ชันจัดการอัปโหลดรูปภาพ
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  // ฟังก์ชันลบรูปภาพ
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ฟังก์ชันบันทึกข้อมูลยา
  const handleSavePill = async () => {
    const pillData: PillReminder = {
      medName,
      totalPills,
      dose,
      times,
      images,
      note,
    };
    console.log("📌 บันทึกข้อมูล:", pillData);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-sec">
      <TitleBar title="เพิ่มยาที่ต้องทาน" href="/PillReminder" />

      {/* ชื่อยา */}
      <div className="w-10/12 mt-10">
        <label
          htmlFor="medName"
          className="block text-lg font-medium text-black mb-2"
        >
          ชื่อยา
        </label>
        <input
          id="medName"
          type="text"
          value={medName}
          onChange={(e) => setMedName(e.target.value)}
          className="w-full h-14  bg-white rounded-xl px-4 text-black border border-grey500"
          placeholder="กรอกชื่อยา"
        />
      </div>

      {/* จำนวนยาทั้งหมด */}
      <div className="w-10/12 mt-5">
        <label
          htmlFor="totalPills"
          className="block text-lg font-medium text-black mb-2"
        >
          จำนวนยาทั้งหมด
        </label>
        <input
          id="totalPills"
          type="text"
          value={totalPills}
          onChange={(e) => setTotalPills(e.target.value)}
          className="w-full h-14 bg-white rounded-xl px-4 text-black border border-grey500"
          placeholder="กรอกจำนวนยาทั้งหมด"
        />
      </div>

      {/* จำนวนยาที่ต้องทานต่อมื้อ */}
      <div className="w-10/12 mt-5">
        <label className="block text-lg font-medium text-black mb-2">
          จำนวนยาที่ต้องทานต่อมื้อ
        </label>
        <div className="flex items-center justify-between space-x-2 rounded-xl h-14">
          {/* ฝั่งซ้าย */}
          <div className="flex justify-center items-center text-lg w-full h-14 bg-white rounded-lg border border-grey500 ">
            <button
              onClick={() => setDose(Math.max(0, dose - 1))}
              className="mr-4 px-2 py-1 rounded-lg text-black"
            >
              <FiMinus />
            </button>
            <span className="text-lg">{dose}</span>
            <button
              onClick={() => setDose(dose + 1)}
              className="ml-4 px-2 py-1 rounded-lg text-black"
            >
              <FiPlus />
            </button>
          </div>

          {/* ฝั่งขวา */}
          <div className="flex justify-center items-center text-lg w-full h-14 bg-white rounded-lg border border-grey500 ">
            เม็ด
          </div>
        </div>
      </div>

      {/* เวลาที่ต้องทาน */}
      <div className="w-10/12 mt-5">
        <label className="block text-lg font-medium text-black mb-2">
          เวลาที่ต้องทาน
        </label>

        <div className="flex flex-wrap gap-2 items-center">
          {sortedTimes.map((time, index) => (
            <div
              key={index}
              className="flex items-center bg-white rounded-lg border border-grey500 px-4 w-26 h-14"
            >
              <span className="text-black text-lg">{time} น.</span>
              <button
                onClick={() => removeTime(index)}
                className="ml-2 text-red-500"
              >
                <FiX />
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowPopup(true)}
            className="w-14 h-14 flex items-center justify-center bg-white rounded-full border border-grey500 cursor-pointer"
          >
            <FiPlus className="text-black text-xl" />
          </button>
        </div>
      </div>

      {/* ฟอร์มอัปโหลดรูป */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="imageUpload"
      />
      <label
        htmlFor="imageUpload"
        className="w-10/12 h-24 mt-5 bg-white rounded-xl flex items-center justify-center border border-dashed cursor-pointer"
      >
        <FiPlus className="mr-2" /> อัปโหลดรูป
      </label>

      <div className="flex flex-wrap w-10/12 mt-3">
        {images.map((img, index) => (
          <div key={index} className="relative m-1">
            <img
              src={URL.createObjectURL(img)}
              alt="ยา"
              className="w-20 h-20 rounded"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            >
              <FiTrash />
            </button>
          </div>
        ))}
      </div>

      {/* ปุ่มบันทึกข้อมูล */}
      <div
        onClick={() => handleSavePill()}
        className="flex w-10/12 h-14 bottom-24 bg-orange300 font-bold text-body1 text-white rounded-xl justify-center items-center"
      >
        บันทึกข้อมูล
      </div>

      {/* Popup สำหรับเพิ่มเวลา */}
      {showPopup && (
        <TimeInputPopup
          onClose={() => setShowPopup(false)}
          onSave={addTime}
        />
      )}
    </div>
  );
}