'use client';
import React, { useState } from "react";
import Header from "@/components/Headertype"; // ตรวจสอบว่าชื่อไฟล์ถูกต้อง (ไม่มีตัวอักษรแปลก)

export default function FormPage() {
  const [gender, setGender] = useState("male");
  const [kidneyLevel, setKidneyLevel] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleBirthdateChange = (e) => {
    const inputDate = new Date(e.target.value);
    const today = new Date();
    let calculatedAge = today.getFullYear() - inputDate.getFullYear();
    const monthDifference = today.getMonth() - inputDate.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < inputDate.getDate())) {
      calculatedAge--;
    }

    setBirthdate(e.target.value);
    setAge(calculatedAge >= 0 ? calculatedAge : ""); // แสดงเฉพาะอายุที่เป็นบวก
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header ที่อยู่ด้านบนสุด */}
      <Header
        title="ข้อมูลส่วนตัว"
        className="fixed top-0 left-0 right-0 w-full bg-white shadow-xl py-4 flex justify-center z-10"
      />

      {/* main section สำหรับกล่องข้อมูลส่วนตัว */}
      <div className="px-4 py-8">
        <main className="bg-white rounded-2xl shadow-lg px-8 py-6 w-full max-w-md mx-auto my-6 mt-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">ระบุข้อมูลส่วนตัวของคุณ</h1>
            <p className="text-sm text-gray-600">
              ข้อมูลนี้จะถูกนำไปใช้เพื่อวัตถุประสงค์ในการคำนวณสารอาหารเท่านั้น โดยไม่มีการเปิดเผยหรือแบ่งปันข้อมูลส่วนตัวใดๆ เพื่อความปลอดภัยและความเป็นส่วนตัวสูงสุดของคุณ
            </p>
          </header>
          <form>
            {/* ชื่อเล่น */}
            <div className="mb-4">
              <label htmlFor="nickname" className="block text-[#BD4B04] font-bold text-[16px] mb-1">
                ชื่อเล่น
              </label>
              <input
                type="text"
                id="nickname"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* เพศ */}
            <div className="mb-4">
              <span className="block text-[#BD4B04] font-bold text-[16px] mb-1">เพศ (เพศโดยกำเนิด)</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-2 text-center font-bold ${
                    gender === "male" ? "bg-orange-400 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  ชาย
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-2 text-center font-bold ${
                    gender === "female" ? "bg-orange-400 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  หญิง
                </button>
              </div>
            </div>

            {/* ระดับโรคไต */}
            <div className="mb-4">
              <label
                htmlFor="kidney-level"
                className="block text-[#BD4B04] font-bold text-[16px] mb-1"
              >
                ระดับโรคไต
              </label>
              <div className="relative border border-gray-300 rounded-2xl bg-white px-4 py-3">
                <select
                  id="kidney-level"
                  value={kidneyLevel}
                  onChange={(e) => setKidneyLevel(e.target.value)}
                  className="w-full appearance-none bg-transparent text-gray-700 focus:outline-none font-bold"
                >
                  <option value="" disabled>
                    เลือกระดับโรคไต
                  </option>
                  <option value="1">ระยะที่ 1</option>
                  <option value="2">ระยะที่ 2</option>
                  <option value="3">ระยะที่ 3</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  เช่น ระยะที่ 1, ระยะที่ 2, ระยะที่ 3, เป็นต้น
                </p>
              </div>
            </div>

            {/* วันเดือนปีเกิด */}
            <div className="mb-4">
              <label htmlFor="birthdate" className="block text-[#BD4B04] font-bold text-[16px] mb-1">
                วันเดือนปีเกิด
              </label>
              <input
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={handleBirthdateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* อายุ */}
            <div className="mb-4">
              <label htmlFor="age" className="block text-[#BD4B04] font-bold text-[16px] mb-1">
                อายุ (ปี)
              </label>
              <input
                type="number"
                id="age"
                value={age}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* ส่วนสูง */}
            <div className="mb-4">
              <label htmlFor="height" className="block text-[#BD4B04] font-bold text-[16px] mb-1">
                ส่วนสูง (ซม.)
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* น้ำหนัก */}
            <div className="mb-6">
              <label htmlFor="weight" className="block text-[#BD4B04] font-bold text-[16px] mb-1">
                น้ำหนัก (กก.)
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* ปุ่มถัดไป */}
            <button
              type="submit"
              className="w-full bg-[#FF7E2E] text-white font-bold py-2 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              ถัดไป
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
