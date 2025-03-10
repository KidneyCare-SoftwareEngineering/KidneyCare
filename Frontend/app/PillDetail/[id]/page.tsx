'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import TitleBar from "@/Components/TitleBar"

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
        // Simulate fetching data
        const pill: MedicineInterface = {
            user_medicine_id: 2,
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
        };

        setMedicine(pill);
    }, [id]);

    if (!medicine) return <div>ไม่มียา</div>;

    return (
        <>
            <TitleBar title={medicine.medicine_name} href="/pillreminder" />
            <div className="flex justify-center flex-col items-center pb-10">
                <Carousel className="w-full mt-1">
                    {medicine.user_medicine_img_link.map((imgLink, index) => (
                        <div key={index} className="flex w-full min-h-64">
                            <img src={imgLink} alt={`Medicine image ${index + 1}`} />
                        </div>
                    ))}
                </Carousel>
                <div className="text-center mt-4">
                    <h2 className="text-xl font-bold">{medicine.medicine_name}</h2>
                    <p className="text-gray-500">{medicine.medicine_note}</p>
                    <p className="text-sm">ปริมาณ: {medicine.medicine_amount} {medicine.medicine_unit}</p>
                    <p className="text-sm">ทานครั้งละ: {medicine.medicine_per_times} {medicine.medicine_unit}</p>
                </div>
            </div>
        </>
    );
}