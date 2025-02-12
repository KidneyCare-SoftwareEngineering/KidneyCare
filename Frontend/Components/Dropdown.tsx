'use client';
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import SendData from "@/Interfaces/SendData";


const Dropdown : React.FC<SendData> = ({selectedOption, setSelectedOption, setSelectedValue}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { text: "ระยะเวลา 1 วัน", value: 1 },
    { text: "ระยะเวลา 7 วัน", value: 7 },
    { text: "ระยะเวลา 30 วัน", value: 30 }
  ];

  const handleOptionClick = (option: { text: string, value: number }) => {
    setSelectedOption(option.text);
    setIsOpen(false);
    setSelectedValue(option.value);
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
                เช่น 1 วัน, 7 วัน, 30 วัน
            </> 
        : null}
        <Icon icon="akar-icons:chevron-down" className="ml-auto" />
        
        
      </button>

      {isOpen && (
        <ul className="absolute left-0 z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {option.text}
            </li>
          ))}
        </ul>
      )}

    </div>

    
  );
};

export default Dropdown;