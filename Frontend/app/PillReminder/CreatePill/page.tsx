"use client";

import React, { useState } from "react";
import TitleBar from "@/Components/TitleBar";
import Swal from "sweetalert2";
import { FiPlus, FiMinus, FiTrash, FiX } from "react-icons/fi";
import TimeInputPopup from "@/Components/Popup/TimeInputPopup";

export default function CreatePill() {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [medName, setMedName] = useState<string>("");
  const [totalPills, setTotalPills] = useState<string>("");
  const [dose, setDose] = useState<number>(0);
  const [times, setTimes] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [note, setNote] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");

  // ฟังก์ชันยืนยันการลบ
  const confirmDelete = (type: "time" | "image", index: number) => {
    let message = "";
    if (type === "time") {
      message = `คุณต้องการลบเวลา ${times[index]} ออกใช่หรือไม่`;
    } else if (type === "image") {
      message = "คุณต้องการลบรูปภาพนี้ใช่หรือไม่";
    }

    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#CCCCCC",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      customClass: {
        cancelButton: 'swal2-cancel-button', // Add custom class for cancel button
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (type === "time") {
          setTimes((prevTimes) => prevTimes.filter((_, i) => i !== index));
        } else if (type === "image") {
          setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        }
        Swal.fire("ลบสำเร็จ!", "ข้อมูลถูกลบเรียบร้อยแล้ว", "success");
      }
    });
  };

  // ฟังก์ชันเพิ่มเวลา
  const addTime = (time: string) => {
    if (time && !times.includes(time)) {
      setTimes([...times, time]);
    } else {
      console.log("⚠️ เวลานี้ถูกเพิ่มไปแล้ว");
    }
    setNewTime(""); // ล้างค่าหลังจากเพิ่ม
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

  // ฟังก์ชันบันทึกข้อมูลยา
  const handleSavePill = async () => {
    if (!medName.trim()) {
      Swal.fire("⚠️ ข้อผิดพลาด", "กรุณากรอกชื่อยา", "warning");
      return;
    }
    if (!totalPills.trim() || isNaN(Number(totalPills)) || Number(totalPills) <= 0) {
      Swal.fire("⚠️ ข้อผิดพลาด", "กรุณากรอกจำนวนยาทั้งหมดให้ถูกต้อง", "warning");
      return;
    }
    if (dose <= 0) {
      Swal.fire("⚠️ ข้อผิดพลาด", "กรุณาเลือกจำนวนยาที่ต้องทานต่อมื้อ", "warning");
      return;
    }
    if (times.length === 0) {
      Swal.fire("⚠️ ข้อผิดพลาด", "กรุณาเพิ่มเวลาที่ต้องทานยา", "warning");
      return;
    }
    if (images.length === 0) {
      Swal.fire("⚠️ ข้อผิดพลาด", "กรุณาเพิ่มรูปภาพของยา", "warning");
      return;
    }
    if (images.length > 4) {
      Swal.fire("⚠️ ข้อผิดพลาด", "รูปภาพต้องไม่เกิน 4 รูป", "warning");
      return;
    }
    if (images.some((img) => img.size > 1024 * 1024)) {
      Swal.fire("⚠️ ข้อผิดพลาด", "ขนาดรูปภาพต้องไม่เกิน 1 MB", "warning");
      return;
    }
    if (note.length > 200) {
      Swal.fire("⚠️ ข้อผิดพลาด", "โน้ตเพิ่มเติมต้องไม่เกิน 200 ตัวอักษร", "warning");
      return;
    }
    if (!note.trim()) {
      Swal.fire("⚠️ ข้อผิดพลาด", "กรุณากรอกโน้ตเพิ่มเติม", "warning");
      return;
    }

    const pillData = {
      medName,
      totalPills: Number(totalPills),
      dose,
      times,
      images,
      note,
    };

    console.log("📌 บันทึกข้อมูล:", pillData);

    Swal.fire("✅ บันทึกสำเร็จ!", "ข้อมูลยาของคุณถูกบันทึกแล้ว", "success");
  };


  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-sec">
      <TitleBar title="เพิ่มยาที่ต้องทาน" href="/PillReminder" />

      {/* ชื่อยา */}
      <div className="w-10/12 mt-10">
        <label htmlFor="medName" className="block text-lg font-medium text-black mb-2">
          ชื่อยา
        </label>
        <input
          id="medName"
          type="text"
          value={medName}
          onChange={(e) => setMedName(e.target.value)}
          className="w-full h-14 bg-white rounded-xl px-4 text-black border border-grey500"
          placeholder="กรอกชื่อยา"
        />
      </div>

      {/* จำนวนยาทั้งหมด */}
      <div className="w-10/12 mt-5">
        <label htmlFor="totalPills" className="block text-lg font-medium text-black mb-2">
          จำนวนยาทั้งหมด
        </label>
        <input
          id="totalPills"
          type="number"
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
            <div key={index} className="flex items-center bg-white rounded-lg border border-grey500 px-4 w-26 h-14 relative">
              <span className="text-black text-lg">{time} น.</span>
              <button
                onClick={() => confirmDelete("time", index)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              >
                <FiTrash />
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

      {/* รูป */}
      <div className="w-10/12 mt-5">
        <label className="block text-lg font-medium text-black mb-2">
          รูปภาพ
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />
        <div className="flex items-center gap-2 mt-5">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt="ยา"
                className="w-24 h-24 rounded-xl object-cover"
              />
              <button
                onClick={() => confirmDelete("image", index)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              >
                <FiTrash />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <label
              htmlFor="imageUpload"
              className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-grey500 cursor-pointer"
            >
              <FiPlus className="text-2xl" />
            </label>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="w-10/12 mt-5">
        <label className="block text-lg font-medium text-black mb-2">
          โน้ตเพิ่มเติม
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-24 bg-white rounded-xl p-4 text-black border border-grey500 leading-6 "
          placeholder="ระบุโน้ตเพิ่มเติม"
        />
      </div>

      {/* ปุ่มบันทึกข้อมูล */}
      <div
        onClick={() => handleSavePill()}
        className="mt-5 mb-5 flex w-10/12 h-14 bottom-24 bg-orange300 font-bold text-body1 text-white rounded-xl justify-center items-center"
      >
        บันทึกข้อมูล
      </div>

      {/* Popup สำหรับเพิ่มเวลา */}
      {showPopup && (
        <TimeInputPopup onClose={() => setShowPopup(false)} onSave={addTime} />
      )}

    </div>
  );
}