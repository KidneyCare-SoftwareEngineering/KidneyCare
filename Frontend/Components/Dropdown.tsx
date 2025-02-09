'use client';
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { StatePage1 } from "@/app/mealplan/CreatePlan/StatePage1";

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("เลือกระยะเวลา");
  const [isCustom, setIsCustom] = useState(false);

  const options = [
    "กำหนดเอง",
    "ระยะเวลา 1 วัน",
    "ระยะเวลา 7 วัน",
    "ระยะเวลา 30 วัน",
  ];

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsCustom(option === "กำหนดเอง");
    setIsOpen(false);
  };

  return (
    <div className="relative w-10/12 mt-8">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full h-20 bg-white rounded-lg border text-body2 font-bold items-center justify-start text-left px-2"
      >
        {selectedOption} <br/>
        {selectedOption === "เลือกระยะเวลา" ? 
            <>
                เช่น 1 วัน, 7 วัน, 30 วัน หรือกำหนดเอง
            </> 
        : null}
        <Icon icon="akar-icons:chevron-down" className="ml-auto" />
        
        
      </button>

      {isOpen && (
        <ul className="absolute left-0 z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isCustom && (
        <div className="mt-4 flex justify-between gap-4">
          <div className="flex items-center w-1/2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md">
            <span className="mr-2 text-gray-500">วันที่เริ่มต้น</span>
            <Calendar size={20} className="text-gray-500" />
          </div>
          <div className="flex items-center w-1/2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md">
            <span className="mr-2 text-gray-500">วันสุดท้าย</span>
            <Calendar size={20} className="text-gray-500" />
          </div>
        </div>
      )}
    </div>

    
  );
};

export default Dropdown;