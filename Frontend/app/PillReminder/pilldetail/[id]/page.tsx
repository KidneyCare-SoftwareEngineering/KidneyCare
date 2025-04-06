'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TitleBar from "@/Components/TitleBar";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";


interface MedicineInterface {
    user_medicine_id: number;
    medicine_schedule: string[];
    medicine_amount: number;
    medicine_per_times: number;
    user_medicine_img_link: string[];
    medicine_unit: string;
    medicine_name: string;
    medicine_note: string;
}

export default function PillDetail() {
    const [medicine, setMedicine] = useState<MedicineInterface | null>(null);
    const { id } = useParams();

    useEffect(() => {
        const pill: MedicineInterface = {
            user_medicine_id: 2,
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
            medicine_note: "เป็นกลุ่มยาที่ช่วยเพิ่มการขับน้ำและเกลือแร่ส่วนเกินออกจากร่างกายทางปัสสาวะ...",
        };

        setMedicine(pill);
    }, [id]);

    if (!medicine) return <div className="text-center text-gray-500 mt-10">ไม่มียา</div>;

    return (
        <>
            <TitleBar title={medicine.medicine_name} href="/pillreminder" />
            <div className="flex justify-center flex-col items-center pb-10">

                {/* แสดงภาพด้วย Swiper */}
                <Swiper
                    className="w-full mt-2"
                    modules={[Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                >
                    {medicine.user_medicine_img_link.map((imgLink, index) => (
                        <SwiperSlide key={index}>
                            <div className="w-full flex justify-center items-center min-h-[200px] bg-red-500">
                                <img
                                    src={imgLink}
                                    alt={`Medicine image ${index + 1}`}
                                    className="w-full h-96 object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* รายละเอียดของยา */}
                <div className="text-center mt-4 px-4 w-full sm:w-10/12 h-auto rounded-xl p-4">
                    <div className="w-ful h-full rounded-xl p-4 bg-sec ">
                        <h1 className="text-2xl font-bold mb-4">ข้อมูลยา</h1>
                        <div className="text-xl flex justify-between items-center mt-2 border-b border-grey200 pb-2 m-5">
                            <p className="font-bold">จำนวนยาทั้งหมด</p>
                            <div className="flex items-center gap-2 text-body3 text-grey500">
                                <p>{medicine.medicine_amount} </p>
                                <p>{medicine.medicine_unit}</p>
                            </div>
                        </div>
                        <div className="text-xl flex justify-between items-center mt-2 border-b border-grey200 pb-2 m-5">
                            <p className="font-bold">จำนวนที่ต้องกินต่อครั้ง</p>
                            <div className="flex items-center gap-2 text-body3 text-grey500">
                                <p>{medicine.medicine_per_times} </p>
                                <p>{medicine.medicine_unit}</p>
                            </div>
                        </div>
                        <div className="text-xl flex justify-between items-center mt-2 border-b border-grey200 pb-2 m-5">
                            <p className="font-bold">เวลา</p>
                            <div className="flex items-center gap-2 text-body3 text-grey500">
                                {medicine.medicine_schedule
                                    .map(time => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                                    .join(', ')}
                            </div>
                        </div>
                        <div className="text-xl mt-2 pb-2 m-5">
                            <p className="font-bold text-left">โน้ตเพิ่มเติม</p>
                            <div className="text-body3 text-grey500 mt-2">
                                <p className="text-left">{medicine.medicine_note}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}