"use client";
import DateSlider from "@/Components/DateSlider";
import Navbar from "@/Components/Navbar";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ChooseEat from "@/Components/ChooseEat/ChooseEat";
import liff from "@line/liff";
import { Meal_planInterface, MedicineData } from "@/Interfaces/Meal_PillInterface";


export default function PillReminder() {
    
    const [dateSelected, setDateSelected] = useState<Date>();
    const formattedDate = dateSelected?.toISOString().split("T")[0] + "T12:00:00";
    const [pill, setPill] = useState<MedicineData>();
    const [userUid, setUserUid] = useState("");

    // Line LIFF
    useEffect(() => {
        const initLiff = async () => {
            try {
            await liff.init({ liffId: "2006794580-MOmlA13n" });
            if (!liff.isLoggedIn()) {
                liff.login(); 
            }
            else{
                console.log("User is logged in", liff.isLoggedIn());
            }
            } catch (error) {
            console.error("Error initializing LIFF: ", error);
            }
            
            try {
                const profile = await liff.getProfile();
                setUserUid(profile.userId);
    
            } catch (error) {
                console.error("Error fetching profile: ", error);
            }
        }; 
        initLiff();
        }, []);
    // ---------------------------------
    
    useEffect(() => {
        const handlegetMedicine = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_medicine`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        user_line_id: userUid,
                        date: formattedDate 
                    }),
                });
                const data = await response.json();
                console.log("data", data);
                setPill(data);
            }
            catch (error) {
                console.log("error", error);
            }
        }
        handlegetMedicine();
    },[formattedDate]);

    

    
    return (
        <>
            <div className="flex reltive flex-col w-full h-full pb-8 min-h-screen bg-sec items-center">
                <Navbar />
                <DateSlider onDateSelect={(date) => setDateSelected(date)} />

                {!pill || !pill.medicines || pill.medicines.length === 0 ? (
                    <>
                        <img src="Nopill.png" width={300} height={300} className=" mt-16" />
                        <div className="text-heading3 mt-8">ยังไม่มีการบันทึกยา</div>
                    </>
                ) : (
                    // <ChooseEat dateSelected={dateSelected} desc="ยา" MealPlans={pill} />
                    <></>
                )}

                <Link
                    href={`/pillreminder/createpill/${userUid}`}
                    className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                >
                    <Icon icon="ic:baseline-plus" height="32" className="text-white" />
                </Link>

            </div>
        </>
    );
}
