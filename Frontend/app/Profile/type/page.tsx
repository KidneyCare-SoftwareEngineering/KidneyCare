'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from "@/components/Headertype"; // ตรวจสอบว่าชื่อไฟล์ถูกต้อง (ไม่มีตัวอักษรแปลก)

export default function FoodSelectionPage() {
  const options = [
    { label: "ทานได้ทั้งหมด", description: "เนื้อ หมู ไก่ อาหารทะเล", image: "/fc4538bff269bc02ebeb0905a55fc0e3.jpg" },
    { label: "มังสวิรัติ", description: "ไม่ทานเนื้อสัตว์หรืออาหารทะเล", image: "/907ebee32691c6f643612b4d9c4f12bc.png" },
    { label: "วีแกน", description: "ไม่ทานผลิตภัณฑ์จากสัตว์", image: "/vegan.png" },
    { label: "ฮาลาล", description: "ไม่ทานเนื้อหมู", image: "/Halal.jpg" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Header */}
      <Header title="เลือกประเภทอาหาร" />

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center p-4 mb-4 bg-white rounded-lg shadow hover:border-orange-500 border-2 hover:bg-[#FFE6D7] "
          >
            <img
              src={option.image}
              alt={option.label}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h2 className="text-lg font-semibold">{option.label}</h2>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
          </div>
        ))}
        <button className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold mt-4">
          ถัดไป
        </button>
      </main>
    </div>
  );
}
