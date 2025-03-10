"use client";
import DateSlider from "@/Components/DateSlider";
import Navbar from "@/Components/Navbar";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useState } from "react";
import ChooseEat from "@/Components/ChooseEat/ChooseEat";
import { motion } from "framer-motion";

export default function PillReminder() {
    const [dateSelected, setDateSelected] = useState<Date>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pill = {
        medicines: [
            {
                user_medicine_id: 1,
                medicine_schedule: ["1990-01-01T12:00:00", "1990-01-01T12:00:00"],
                medicine_amount: 50,
                medicine_per_times: 1,
                user_medicine_img_link: [
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/a7524e22-3209-4470-91e2-49a8957483e6.webp",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/c29e88f8-7bcb-47f5-a4bc-a849579a263c.png",
                ],
                medicine_unit: "เม็ด",
                medicine_name: "ยาขับปัสสาวะ",
                medicine_note: "ทานแล้วง่วง",
            },
            {
                user_medicine_id: 2,
                medicine_schedule: ["1990-01-01T12:00:00", "1990-01-01T12:00:00"],
                medicine_amount: 50,
                medicine_per_times: 2,
                user_medicine_img_link: [
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/a7524e22-3209-4470-91e2-49a8957483e6.webp",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/c29e88f8-7bcb-47f5-a4bc-a849579a263c.png",
                ],
                medicine_unit: "เม็ด",
                medicine_name: "ยาขับปัสสาวะ",
                medicine_note: "ทานแล้วง่วง",
            },
            {
                user_medicine_id: 3,
                medicine_schedule: ["1990-01-01T12:00:00", "1990-01-01T12:00:00"],
                medicine_amount: 50,
                medicine_per_times: 3,
                user_medicine_img_link: [
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/a7524e22-3209-4470-91e2-49a8957483e6.webp",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/c29e88f8-7bcb-47f5-a4bc-a849579a263c.png",
                ],
                medicine_unit: "เม็ด",
                medicine_name: "ยาขับปัสสาวะ",
                medicine_note: "ทานแล้วง่วง",
            },
            {
                user_medicine_id: 4,
                medicine_schedule: ["1990-01-01T12:00:00", "1990-01-01T12:00:00"],
                medicine_amount: 50,
                medicine_per_times: 4,
                user_medicine_img_link: [
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/a7524e22-3209-4470-91e2-49a8957483e6.webp",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/c29e88f8-7bcb-47f5-a4bc-a849579a263c.png",
                ],
                medicine_unit: "เม็ด",
                medicine_name: "ยาขับปัสสาวะ",
                medicine_note: "ทานแล้วง่วง",
            },
            {
                user_medicine_id: 5,
                medicine_schedule: ["1990-01-01T12:00:00", "1990-01-01T12:00:00"],
                medicine_amount: 50,
                medicine_per_times: 5,
                user_medicine_img_link: [
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/a7524e22-3209-4470-91e2-49a8957483e6.webp",
                    "https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/pills/c29e88f8-7bcb-47f5-a4bc-a849579a263c.png",
                ],
                medicine_unit: "เม็ด",
                medicine_name: "ยาขับปัสสาวะ",
                medicine_note: "ทานแล้วง่วง",
            },
        ],
    };

    return (
        <>
            <div className="flex reltive flex-col w-full h-full pb-8 min-h-screen bg-sec items-center">
                <Navbar />
                <DateSlider onDateSelect={(date) => setDateSelected(date)} />

                {!pill ? (
                    <>
                        <img src="NoFood.png" className="size-48 mt-32" />
                        <div className="text-heading3 mt-8">ยังไม่มีการบันทึกยา</div>
                    </>
                ) : (
                    <ChooseEat dateSelected={dateSelected} desc="ยา" MealPlans={pill} />
                )}

                {!pill ? (
                    <Link
                        href="/pillreminder/createpill"
                        className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                    >
                        <Icon icon="ic:baseline-plus" height="32" className="text-white" />
                    </Link>
                ) : (
                    <>
                        {isMenuOpen ? (
                            <div
                                onClick={() => setIsMenuOpen(false)}
                                className="fixed bg-gradient-to-tl from-white to-transparent right-0 bottom-0 w-full h-full"
                            >
                                <motion.div
                                    onClick={() => setIsMenuOpen(false)}
                                    className="fixed size-12 bg-white border border-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 45 }}
                                    exit={{ rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Icon
                                        icon="ic:baseline-plus"
                                        height="32"
                                        className="text-orange300"
                                    />
                                </motion.div>

                                <div onClick={() => console.log("edit")} className="fixed">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="fixed size-12 right-16 bottom-20 flex justify-center items-center"
                                    >
                                        แก้ไข
                                    </motion.div>
                                    <motion.div
                                        className="fixed size-12 bg-orange300 rounded-full right-3 bottom-20 flex justify-center items-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Icon
                                            icon="ic:sharp-edit"
                                            height="20"
                                            className="text-white"
                                        />
                                    </motion.div>
                                </div>

                                <Link href={`/pillreminder/createpill`} className="fixed">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="fixed  right-32 bottom-9 flex justify-center items-center"
                                    >
                                        สร้างแผน
                                    </motion.div>
                                    <motion.div
                                        className="fixed size-12 bg-orange300 rounded-full right-16 bottom-6 flex justify-center items-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Icon
                                            icon="ic:sharp-edit"
                                            height="20"
                                            className="text-white"
                                        />
                                    </motion.div>
                                </Link>
                            </div>
                        ) : (
                            <motion.div
                                onClick={() => setIsMenuOpen(true)}
                                className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 0 }}
                                exit={{ rotate: -45 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Icon
                                    icon="ic:baseline-plus"
                                    height="32"
                                    className="text-white"
                                />
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
