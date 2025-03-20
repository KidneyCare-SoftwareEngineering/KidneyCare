"use client";

import React, { useEffect, useState } from "react";
import TitleBar from "@/Components/TitleBar";
import Swal from "sweetalert2";
import { FiPlus, FiMinus, FiTrash, FiX } from "react-icons/fi";
import TimeInputPopup from "@/Components/Popup/TimeInputPopup";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function CreatePill() {
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [pill_name, setpill_name] = useState<string>("");
    const [pill_amount, setpill_amount] = useState<string>("");
    const [pill_per_meal, setpill_per_meal] = useState<number>(0);
    const [pill_reminder_time, setpill_reminder_time] = useState<string[]>([]);
    const [pill_img_link, setpill_img_link] = useState<File[]>([]);
    const [pill_note, setpill_note] = useState<string>("");
    const [newTime, setNewTime] = useState<string>("");

    const pill = {
        medicines: [
            {
                user_medicine_id: 1,
                medicine_schedule: ["1990-01-01T08:00:00", "1990-01-01T12:00:00", "1990-01-01T15:00:00"],
                medicine_amount: 50,
                medicine_per_times: 1,
                user_medicine_img_link: [
                    "https://www.vzipbag.com/vzipbag_com_zip444.jpg",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/a7524e22-3209-4470-91e2-49a8957483e6.webp",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/c29e88f8-7bcb-47f5-a4bc-a849579a263c.png",
                ],
                medicine_unit: "เม็ด",
                medicine_name: "ยาขับปัสสาวะ",
                medicine_note: "เป็นกลุ่มยาที่ช่วยเพิ่มการขับน้ำและเกลือแร่ส่วนเกินออกจากร่างกายทางปัสสาวะโดยยาประเภทนี้มีจุดประสงค์เพื่อรักษาหรือบรรเทาอาการจากโรคหรือภาวะที่เกี่ยวข้องกับการสะสมของน้ำในร่างกาย เช่น ความดันโลหิตสูง, ภาวะบวมน้ำ, หรือภาวะหัวใจล้มเหลว",
            }
        ],
    };

    useEffect(() => {
        const medicine = pill.medicines[0];
        setpill_name(medicine.medicine_name);
        setpill_amount(medicine.medicine_amount.toString());
        setpill_per_meal(medicine.medicine_per_times);
        setpill_reminder_time(medicine.medicine_schedule.map(time => new Date(time).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })));
        setpill_img_link(medicine.user_medicine_img_link); // Store URLs directly
        setpill_note(medicine.medicine_note);
    }, []);


    const confirmDelete = (type: "time" | "image", index: number) => {
        let message = "";
        if (type === "time") {
            message = `คุณต้องการลบเวลา ${pill_reminder_time[index]} น. ออกใช่หรือไม่`;
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
                    setpill_reminder_time((prevpill_reminder_time) => prevpill_reminder_time.filter((_, i) => i !== index));
                } else if (type === "image") {
                    setpill_img_link((prevpill_img_link) => prevpill_img_link.filter((_, i) => i !== index));
                }
                Swal.fire("ลบสำเร็จ!", "ข้อมูลถูกลบเรียบร้อยแล้ว", "success");
            }
        });
    };

    // ฟังก์ชันเพิ่มเวลา
    const addTime = (time: string) => {
        if (time && !pill_reminder_time.includes(time)) {
            setpill_reminder_time([...pill_reminder_time, time]);
        } else {
            console.log("⚠️ เวลานี้ถูกเพิ่มไปแล้ว");
        }
        setNewTime(""); // ล้างค่าหลังจากเพิ่ม
    };

    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, "0");
        const day = String(now.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // ฟังก์ชันเรียงลำดับเวลาโดยใช้วันที่ปัจจุบัน
    const sortedpill_reminder_time = [...pill_reminder_time].sort((a, b) => {
        const today = new Date().toISOString().split("T")[0];
        return new Date(`${today}T${a}:00+07:00`).getTime() - new Date(`${today}T${b}:00+07:00`).getTime();
    });

    // ฟังก์ชันจัดการการอัปโหลดรูปภาพ
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const files = Array.from(event.target.files);

        // ตรวจสอบขนาดไฟล์ก่อนการอัปโหลด
        const newImages = files.map((file) => {
            if (file.size > 1024 * 1024) {
                Swal.fire("⚠️ ข้อผิดพลาด", "ขนาดรูปภาพต้องไม่เกิน 1 MB", "warning");
                return null; // ไม่ให้เพิ่มไฟล์ที่มีขนาดเกิน 1MB
            } else if (file instanceof File) {
                return file; // กรณีไฟล์ปกติ
            } else {
                return new File([], "invalid");
            }
        }).filter(Boolean); // กำจัด null หรือ invalid ไฟล์ที่ไม่ต้องการ

        setpill_img_link((prev) => [...prev, ...newImages.filter((img): img is File => img !== null)]);
    };

    const validatePillData = () => {
        if (!pill_name.trim()) return "กรุณากรอกชื่อยา";
        if (!pill_amount.trim() || isNaN(Number(pill_amount)) || Number(pill_amount) <= 0)
            return "กรุณากรอกจำนวนยาทั้งหมดให้ถูกต้อง";
        if (pill_per_meal <= 0) return "กรุณาเลือกจำนวนยาที่ต้องทานต่อมื้อ";
        if (pill_reminder_time.length === 0) return "กรุณาเพิ่มเวลาที่ต้องทานยา";
        if (pill_img_link.length === 0) return "กรุณาเพิ่มรูปภาพของยา";
        if (pill_img_link.length > 4) return "รูปภาพต้องไม่เกิน 4 รูป";
        if (pill_img_link.some(img => img.size > 1024 * 1024)) return "ขนาดรูปภาพต้องไม่เกิน 1 MB";
        if (pill_note.length > 200) return "โน้ตเพิ่มเติมต้องไม่เกิน 200 ตัวอักษร";
        if (!pill_note.trim()) return "กรุณากรอกโน้ตเพิ่มเติม";
        return null; // ผ่านการตรวจสอบ
    };

    const handleSavePill = async () => {
        const errorMessage = validatePillData();
        if (errorMessage) {
            Swal.fire("⚠️ ข้อผิดพลาด", errorMessage, "warning");
            return;
        }

        const formattedPillReminderTime = pill_reminder_time.map(time => `${getCurrentDate()}T${time}:00`);

        const pillData = {
            pill_name,
            pill_amount: Number(pill_amount),
            pill_per_meal,
            pill_reminder_time: formattedPillReminderTime,
            pill_img_link,
            pill_note,
        };

        console.log("📌 บันทึกข้อมูล:", pillData);

        Swal.fire("✅ บันทึกสำเร็จ!", "ข้อมูลยาของคุณถูกบันทึกแล้ว", "success");
    };


    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-sec">
            <TitleBar title="แก้ไขรายละเอียดยา" href="/pillreminder" />

            {/* ชื่อยา */}
            <div className="w-10/12 mt-10">
                <label htmlFor="pill_name" className="block text-lg font-medium text-black mb-2">
                    ชื่อยา
                </label>
                <input
                    id="pill_name"
                    type="text"
                    value={pill_name}
                    onChange={(e) => setpill_name(e.target.value)}
                    className="w-full h-14 bg-white rounded-xl px-4 text-black border border-grey500"
                    placeholder="กรอกชื่อยา"
                />
            </div>

            {/* จำนวนยาทั้งหมด */}
            <div className="w-10/12 mt-5">
                <label htmlFor="pill_amount" className="block text-lg font-medium text-black mb-2">
                    จำนวนยาทั้งหมด
                </label>
                <input
                    id="pill_amount"
                    type="number"
                    value={pill_amount}
                    onChange={(e) => setpill_amount(e.target.value)}
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
                            onClick={() => setpill_per_meal(Math.max(0, pill_per_meal - 1))}
                            className="mr-4 px-2 py-1 rounded-lg text-black"
                        >
                            <FiMinus />
                        </button>
                        <span className="text-lg">{pill_per_meal}</span>
                        <button
                            onClick={() => setpill_per_meal(pill_per_meal + 1)}
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
                    {sortedpill_reminder_time.map((time, index) => (
                        <div key={index} className="flex items-center bg-white rounded-lg border border-grey500 px-4 w-26 h-14 relative">
                            <span className="text-black text-lg">{time} น.</span>
                            <button
                                onClick={() => confirmDelete("time", index)}
                                className=" top-0 right-0  text-white p-1 rounded-full"
                            >
                                <Icon className="ml-2 text-red-500" icon="mdi:close-circle" width="24" />
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
                    {/* แสดงรูปภาพ */}
                    {pill_img_link.map((img, index) => (
                        <div key={index} className="relative">
                            <img
                                // ตรวจสอบว่า img เป็น File หรือไม่ และแสดงผลตามนั้น
                                src={img instanceof File ? URL.createObjectURL(img) : img}
                                alt="ยา"
                                className="w-24 h-24 rounded-xl object-cover"
                            />
                            <button
                                onClick={() => confirmDelete("image", index)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-1 rounded-full"
                            >
                                <FiTrash />
                            </button>
                        </div>
                    ))}
                    {pill_img_link.length < 4 && (
                        <label
                            htmlFor="imageUpload"
                            className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-grey500 cursor-pointer"
                        >
                            <FiPlus className="text-2xl" />
                        </label>
                    )}
                </div>
            </div>

            {/* pill_note */}
            <div className="w-10/12 mt-5">
                <label className="block text-lg font-medium text-black mb-2">
                    โน้ตเพิ่มเติม
                </label>
                <textarea
                    value={pill_note}
                    onChange={(e) => setpill_note(e.target.value)}
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