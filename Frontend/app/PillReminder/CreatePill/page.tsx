"use client";

import React, { useState } from "react";
import TitleBar from "@/Components/TitleBar";
import { FiPlus, FiMinus, FiTrash, FiX } from "react-icons/fi";
import TimeInputPopup from "@/Components/Popup/TimeInputPopup";
import ConfirmDeletePopup from "@/Components/Popup/ConfirmDeletePopup";

// ประกาศประเภทของข้อมูลใน Props ของ ConfirmDeletePopup
interface ShowDeletePopup {
  type: "time" | "image" | "";
  index: number | null;
}

export default function CreatePlan() {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [medName, setMedName] = useState<string>("");
  const [totalPills, setTotalPills] = useState<string>("");
  const [dose, setDose] = useState<number>(0);
  const [times, setTimes] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [note, setNote] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");

  const [showDeletePopup, setShowDeletePopup] = useState<ShowDeletePopup>({
    type: "",
    index: null,
  });  // สำหรับการแสดง popup ลบ

  // ฟังก์ชันลบเวลา
  const removeTime = (index: number) => {
    setShowDeletePopup({ type: "time", index });
  };

  // ฟังก์ชันลบรูป
  const removeImage = (index: number) => {
    setShowDeletePopup({ type: "image", index });
  };

  // ฟังก์ชันยืนยันการลบ
  const confirmDelete = () => {
    if (showDeletePopup.type === "time" && showDeletePopup.index !== null) {
      setTimes(times.filter((_, i) => i !== showDeletePopup.index));
    } else if (showDeletePopup.type === "image" && showDeletePopup.index !== null) {
      setImages(images.filter((_, i) => i !== showDeletePopup.index));
    }
    setShowDeletePopup({ type: "", index: null });  // ซ่อน popup หลังยืนยัน
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
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!medName.trim()) {
      alert("⚠️ กรุณากรอกชื่อยา");
      return;
    }
    if (!totalPills.trim() || isNaN(Number(totalPills)) || Number(totalPills) <= 0) {
      alert("⚠️ กรุณากรอกจำนวนยาทั้งหมดให้ถูกต้อง");
      return;
    }
    if (dose <= 0) {
      alert("⚠️ กรุณาเลือกจำนวนยาที่ต้องทานต่อมื้อ");
      return;
    }
    if (times.length === 0) {
      alert("⚠️ กรุณาเพิ่มเวลาที่ต้องทานยา");
      return;
    }
    if (images.length === 0) {
      alert("⚠️ กรุณาเพิ่มรูปภาพของยา");
      return;
    }
    if (images.length > 4) {
      alert("⚠️ รูปภาพต้องไม่เกิน 4 รูป");
      return;
    }
    if (images.some((img) => img.size > 1024 * 1024)) {
      alert("⚠️ ขนาดรูปภาพต้องไม่เกิน 1 MB");
      return;
    }
    if (note.length > 200) {
      alert("⚠️ โน้ตเพิ่มเติมต้องไม่เกิน 200 ตัวอักษร");
      return;
    }
    if (!note.trim()) {
      alert("⚠️ กรุณากรอกโน้ตเพิ่มเติม");
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
                onClick={() => removeTime(index)}
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
                onClick={() => removeImage(index)}
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

      {/* แสดง Popup สำหรับยืนยันการลบ */}
      {showDeletePopup.type && (
        <ConfirmDeletePopup
          onClose={() => setShowDeletePopup({ type: "", index: null })}
          onConfirm={confirmDelete}
          type={showDeletePopup.type}
          times={times}
          showDeletePopup={showDeletePopup}
        />
      )}
    </div>
  );
}