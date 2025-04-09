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
    const [pillTaken, setPillTaken] = useState<MedicineData>();
    const [userUid, setUserUid] = useState("U5251e034b6d1a207df047bf7fb34e30a");
    const [mapPill, setMapPill] = useState<{ medicines: MedicineData[] }>();

    useEffect(() => {
        const fetchMedicineData = async () => {
          try {
            const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_all_user_medicines?user_line_id=${userUid}`);
            const allMedicines = await res1.json();
      
            const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_all_user_take_medicines?user_line_id=${userUid}`);
            const takenMedicines = await res2.json();
      
            const targetDate = formattedDate?.split("T")[0];
      
            const mergedData = allMedicines.map((medicine: MedicineData) => {
              const taken = takenMedicines.find(
                (take: any) =>
                  take.user_medicine_id === medicine.user_medicine_id &&
                  take.user_take_medicine_time === targetDate
              );
      
              return {
                ...medicine,
                ischecked: taken ? taken.is_medicine_taken : false,
              };
            });
      
            
            setMapPill({ medicines: mergedData });
      
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
      
        fetchMedicineData();
      }, [formattedDate, userUid])

      

    // Line LIFF
    // useEffect(() => {
    //     const initLiff = async () => {
    //         try {
    //         await liff.init({ liffId: "2006794580-MOmlA13n" });
    //         if (!liff.isLoggedIn()) {
    //             liff.login(); 
    //         }
    //         else{
    //             console.log("User is logged in", liff.isLoggedIn());
    //         }
    //         } catch (error) {
    //         console.error("Error initializing LIFF: ", error);
    //         }
            
    //         try {
    //             const profile = await liff.getProfile();
    //             setUserUid(profile.userId);
    
    //         } catch (error) {
    //             console.error("Error fetching profile: ", error);
    //         }
    //     }; 
    //     initLiff();
    //     }, []);
    // ---------------------------------
    
    
    // useEffect(() => {
    //     fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_all_user_medicines?user_line_id=${userUid}`)
    //         .then(response => response.json())
    //         .then(data => {
    //         setPill(data);
    //         console.log("all_user",data)
    //         })
    //         .catch(error => {
    //         console.error('Error fetching user data:', error)
    //         })
    //     }, [formattedDate, userUid])
    
    // useEffect(() => {
    //     fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_all_take_user_medicines?user_line_id=${userUid}`)
    //         .then(response => response.json())
    //         .then(data => {
    //         setPillTaken(data);
    //         console.log("all_user",data)
    //         })
    //         .catch(error => {
    //         console.error('Error fetching user data:', error)
    //         })
    //     }, [formattedDate, userUid])



    

    
    return (
        <>
            <div className="flex reltive flex-col w-full h-full pb-8 min-h-screen bg-sec items-center">
                <Navbar />
                <DateSlider onDateSelect={(date) => setDateSelected(date)} />

                {!mapPill || mapPill.medicines.length === 0 ? (
                    <>
                        <img src="Nopill.png" width={300} height={300} className=" mt-16" />
                        <div className="text-heading3 mt-8">ยังไม่มีการบันทึกยา</div>
                    </>
                ) : (
                    <ChooseEat dateSelected={dateSelected} desc="ยา" MealPlans={mapPill}/>
                )}

                <Link
                    href={`/PillReminder/Createpill/${userUid}`}
                    className="fixed size-12 bg-orange300 rounded-full right-3 bottom-6 flex justify-center items-center"
                >
                    <Icon icon="ic:baseline-plus" height="32" className="text-white" />
                </Link>

            </div>
        </>
    );
}
