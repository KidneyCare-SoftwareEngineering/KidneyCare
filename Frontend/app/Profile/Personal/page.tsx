import React from "react";
import Header from "@/components/Headertype"; // ตรวจสอบว่าชื่อไฟล์ถูกต้อง (ไม่มีตัวอักษรแปลก)

export default function FormPage() {
  return (
    <div className="min-h-screen bg-orange-50  ">
      {/* Header ที่อยู่ด้านบนสุด */}
      <Header
  title="ข้อมูลส่วนตัว"
  className="fixed top-0 left-0 right-0 w-full bg-white shadow-xl py-4 flex justify-center z-10  "
/>


      {/* main section สำหรับกล่องข้อมูลส่วนตัว */}
      <div className="px-4 py-8 ">
      <main className="bg-white rounded-2xl shadow-lg px-8 py-6 w-full max-w-md mx-auto my-6 mt-4">
      <header className="mb-6  ">
          <h1 className="text-2xl font-bold text-gray-800">ระบุข้อมูลส่วนตัวของคุณ</h1>
          <p className="text-sm text-gray-600">
          ข้อมูลนี้จะถูกนำไปใช้เพื่อวัตถุประสงค์ในการคำนวณสารอาหารเท่านั้น 
โดยไม่มีการเปิดเผยหรือแบ่งปันข้อมูลส่วนตัวใดๆ เพื่อความปลอดภัย
และความเป็นส่วนตัวสูงสุดของคุณ
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
            <span className="block text-[#BD4B04]  font-bold text-[16px] mb-1">เพศ (เพศโดยกำเนิด)</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  className="form-radio text-orange-400"
                />
                <span className="ml-2">ชาย</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  className="form-radio text-orange-400"
                />
                <span className="ml-2">หญิง</span>
              </label>
            </div>
          </div>

          {/* ระดับโรคไต */}
          <div className="mb-4">
            <label htmlFor="kidney-level" className="block text-[#BD4B04]  font-bold text-[16px] mb-1">
              ระดับโรคไต
            </label>
            <select
              id="kidney-level"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">เลือกระดับโรคไต</option>
              <option value="1">ระยะที่ 1</option>
              <option value="2">ระยะที่ 2</option>
              <option value="3">ระยะที่ 3</option>
              <option value="4">เป็นต้น</option>
            </select>
          </div>

          {/* วันเดือนปีเกิด */}
          <div className="mb-4">
            <label htmlFor="birthdate" className="block text-[#BD4B04]  font-bold text-[16px] mb-1">
              วันเดือนปีเกิด
            </label>
            <input
              type="date"
              id="birthdate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* อายุ */}
          <div className="mb-4">
            <label htmlFor="age" className="block text-[#BD4B04]  font-bold text-[16px] mb-1">
              อายุ (ปี)
            </label>
            <input
              type="number"
              id="age"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            
            />
          </div>

          {/* ส่วนสูง */}
          <div className="mb-4">
            <label htmlFor="height" className="block text-[#BD4B04]  font-bold text-[16px] mb-1">
              ส่วนสูง (ซม.)
            </label>
            <input
              type="number"
              id="height"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            
            />
          </div>

          {/* น้ำหนัก */}
          <div className="mb-6">
            <label htmlFor="weight" className="block text-[#BD4B04]  font-bold text-[16px] mb-1">
              น้ำหนัก (กก.)
            </label>
            <input
              type="number"
              id="weight"
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
