'use client';
import React, { useEffect, useState } from "react";
import TitleBarStatePage from "@/Components/TitleBarStatePage";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Register1Interface } from "@/Interfaces/RegisterInterface";

const Register1: React.FC<Register1Interface> = ({setSelectCondition, selectCondition, statePage, setStatePage}) => {

  
  const handleSelection = (index: number) => {
    setSelectCondition([index]); 
  };



  const options = [
    { label: "ทานได้ทั้งหมด", description: "เนื้อ หมู ไก่ อาหารทะเล", image: "/fc4538bff269bc02ebeb0905a55fc0e3.jpg" },
    { label: "มังสวิรัติ", description: "ไม่ทานเนื้อสัตว์หรืออาหารทะเล", image: "/907ebee32691c6f643612b4d9c4f12bc.png" },
    { label: "วีแกน", description: "ไม่ทานผลิตภัณฑ์จากสัตว์", image: "/vegan.png" },
    { label: "ฮาลาล", description: "ไม่ทานเนื้อหมู", image: "/Halal.jpg" },
  ];

  return(
    <>
      <div className="flex w-screen min-h-screen flex-col items-center bg-sec">
        <TitleBarStatePage title="เลือกประเภทอาหาร" statePage={statePage} setStatePage={setStatePage}/>



        {/* Main Content */}
        <main className="flex w-11/12 h-full flex-col p-4 mt-8">
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center p-4 mb-4 rounded-lg drop-shadow-xl border-2 
                ${selectCondition.includes(index) ? "border-orange300 bg-fillstrock transition-colors duration-300 ease-in-out" : "bg-white transition-colors duration-300 ease-in-out"}`}
              onClick={() => handleSelection(index)}
            >
              <img
                src={option.image}
                alt={option.label}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h2 className="text-body2 font-bold">{option.label}</h2>
                <p className="text-body3 text-grey300">{option.description}</p>
              </div>
            </div>
          ))}
          <button
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold mt-4 disabled:opacity-50"
            disabled={selectCondition === null}
            onClick={() => setStatePage(2)}
          >
            ถัดไป
          </button>
        </main>
      </div>
      
    </>
  )
}

export default Register1