'use client';
import React, { useState } from "react";
import Header from "@/components/Headertype";

export default function FormPage() {
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);

  const toggleCheckbox = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <Header
        title="ข้อมูลส่วนตัว"
        className="fixed top-0 left-0 right-0 w-full bg-white shadow-xl py-4 flex justify-center z-10"
      />

      {/* Main Section */}
      <div className="px-4 py-8">
        <main className="bg-white rounded-2xl shadow-lg px-8 py-6 w-full max-w-md mx-auto my-6 mt-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">ระบุข้อมูลสุขภาพของคุณ</h1>
          </header>

          <form>
            {/* โรคหรืออาการที่เป็นอยู่ */}
            <div className="mb-6">
              <span className="block text-[#BD4B04] font-bold text-[16px] mb-0">โรคหรืออาการที่เป็นอยู่</span>
              <span className="text-[#999999]">หากไม่มีโรคหรืออาการอื่นๆสามารถเว้นว่างได้</span>
              {[
                "โรคเบาหวาน",
                "โรคความดันโลหิตสูง",
                "โรคหลอดเลือดหัวใจ",
                "โรคไต",
                "โรคเกาต์",
                "อื่นๆ",
              ].map((condition) => (
                <label key={condition} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden peer"
                    checked={conditions.includes(condition)}
                    onChange={() => toggleCheckbox(condition, conditions, setConditions)}
                  />
                  <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-[#FF7E2E] peer-checked:border-[#FF7E2E]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white hidden peer-checked:block"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z" />
                    </svg>
                  </span>
                  <span className="ml-3">{condition}</span>
                </label>
              ))}
            </div>

            {/* อาการหรือของกินที่แพ้ */}
            <div className="mb-6">
              <span className="block text-[#BD4B04] font-bold text-[16px] mb-0">อาการหรือของกินที่แพ้</span>
              <span className="text-[#999999]">หากไม่มีโรคหรืออาการอื่นๆสามารถเว้นว่างได้</span>
              {[
                "กลูเตน",
                "ถั่วลิสง",
                "อาหารทะเล",
                "อื่นๆ",
              ].map((allergy) => (
                <label key={allergy} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden peer"
                    checked={allergies.includes(allergy)}
                    onChange={() => toggleCheckbox(allergy, allergies, setAllergies)}
                  />
                  <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-[#FF7E2E] peer-checked:border-[#FF7E2E]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white hidden peer-checked:block"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z" />
                    </svg>
                  </span>
                  <span className="ml-3">{allergy}</span>
                </label>
              ))}
            </div>

            {/* เป้าหมายสุขภาพ */}
            <div className="mb-6">
              <span className="block text-[#BD4B04] font-bold text-[16px] mb-0">เป้าหมายสุขภาพ</span>
              <span className="text-[#999999]">หากไม่มีเป้าหมายสามารถเว้นว่างได้</span>
              {[
                "ต้องการรักษาน้ำหนัก",
                "ต้องการลดน้ำหนัก",
                "ต้องการเพิ่มน้ำหนัก",
              ].map((goal) => (
                <label key={goal} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden peer"
                    checked={healthGoals.includes(goal)}
                    onChange={() => toggleCheckbox(goal, healthGoals, setHealthGoals)}
                  />
                  <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-[#FF7E2E] peer-checked:border-[#FF7E2E]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white hidden peer-checked:block"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z" />
                    </svg>
                  </span>
                  <span className="ml-3">{goal}</span>
                </label>
              ))}
            </div>

            {/* ปุ่มบันทึก */}
            <button
              type="submit"
              className="w-full bg-[#FF7E2E] text-white font-bold py-2 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              บันทึก
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
