'use client';
import React, { useEffect, useState } from "react";
import TitleBarStatePage from "@/Components/TitleBarStatePage";
import StatePage1 from "./Register1";
import StatePage2 from "./Register2";
import liff from "@line/liff";

// import RegisterInterface from "@/Interfaces/RegisterInterface";

export default function Register() {
    const [userUid, setUserUid] = useState("");
    const [userProfile, setUserProfile] = useState<string | null>("");
    // Line LIFF
    useEffect(() => {
        const initLiff = async () => {
            try {
            await liff.init({ liffId: "2006794580-6ZGZ5Eja" });
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
                setUserProfile(profile.pictureUrl ?? "");
                console.log("userUid", profile.pictureUrl);
    
            } catch (error) {
                console.error("Error fetching profile: ", error);
            }
        }; 
        initLiff();
        }, []);
    // ---------------------------------
    const [name, setName] = useState("")
    const [gender, setGender] = useState("Male")
    const [kidneyLevel, setKidneyLevel] = useState(0)
    const [birthdate, setBirthdate] = useState(() => {
        const initialDate = new Date("2025-02-14T17:00:00.000")
        return initialDate.toISOString()
    });
    const [dialysis, setDialysis] = useState(false)
    const [age, setAge] = useState(0)
    const [height, setHeight] = useState<number>(0)
    const [weight, setWeight] = useState<number>(0)
    const [statePage, setStatePage] = useState(0)
    const [selectCondition, setSelectCondition] = useState<number[]>([])




    const handleBirthdateChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const inputDate = new Date(e.target.value);
        const today = new Date();
        let calculatedAge = today.getFullYear() - inputDate.getFullYear();
        const monthDifference = today.getMonth() - inputDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < inputDate.getDate())) {
            calculatedAge--;
    }   

        setBirthdate(e.target.value);
        setAge(calculatedAge >= 0 ? calculatedAge : 0); 
    };


    const handleBirthdatetoISO = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = event.target.value; 
        const newDate = new Date(`${selectedDate}T17:00:00.000`).toISOString();
        setBirthdate(newDate);
    };


  return (
    <>
    {statePage === 0 &&
        <div className="min-h-screen bg-orange-50">
            <div className="relative flex justify-center items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold ">
            ข้อมูลส่วนตัว
            </div>

            {/* main section สำหรับกล่องข้อมูลส่วนตัว */}
            <div className="flex w-screen h-full px-4 py-8">
                <main className="flex flex-col w-full bg-white rounded-2xl shadow-lg px-8 py-6 max-w-md mx-auto my-6 mt-4">
                    <header className="mb-6">
                        <h1 className="text-heading3 font-bold text-gray-800">ระบุข้อมูลส่วนตัวของคุณ</h1>
                        <p className="text-body3 text-gray-600">
                            ข้อมูลนี้จะถูกนำไปใช้เพื่อวัตถุประสงค์ในการคำนวณสารอาหารเท่านั้น โดยไม่มีการเปิดเผยหรือแบ่งปันข้อมูลส่วนตัวใดๆ เพื่อความปลอดภัยและความเป็นส่วนตัวสูงสุดของคุณ
                        </p>
                    </header>
                        {/* ชื่อเล่น */}
                        <div className="mb-4">
                            <label htmlFor="nickname" className="block text- font-bold text-body1 mb-1">
                            ชื่อเล่น
                            </label>
                            <input
                            type="text"
                            id="nickname"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>




                        {/* เพศ */}
                        <div className="flex text-[#BD4B04] font-bold text-body1 mb-1">เพศ (เพศโดยกำเนิด)</div>
                        <div className="flex relative w-full flex-col mb-20">
                            <div className="flex absolute w-full min-h-16 rounded-xl border border-grey300 bg-sec">
                                <div 
                                    className={`flex w-1/2 rounded-xl m-1  justify-center items-center text-body1 ${
                                        gender === "Male" ? "bg-orange300 text-white drop-shadow-xl transition-colors duration-300 ease-in-out" : "bg-sec text-gray-800 transition-colors duration-300 ease-in-out"
                                        }`}
                                    onClick={() => setGender("Male")}>
                                ชาย
                                </div>
                                <div 
                                    className={`flex w-1/2 rounded-xl m-1 justify-center items-center text-body1 ${
                                        gender === "Female" ? "bg-orange300 text-white drop-shadow-xl transition-colors duration-300 ease-in-out" : "bg-sec text-gray-800 transition-colors duration-300 ease-in-out"
                                        }`}
                                    onClick={() => setGender("Female")}>
                                หญิง
                                </div>
                            </div>
                        </div>





                        {/* ระดับโรคไต */}
                        <div className="mb-4">
                            <label
                                htmlFor="kidney-level"
                                className="block text-[#BD4B04] font-bold text-body1 mb-1"
                                >
                                ระดับโรคไต
                            </label>
                            <div className="relative border border-gray-300 rounded-2xl bg-white px-4 py-3">
                                <select
                                    id="kidney-level"
                                    value={kidneyLevel}
                                    onChange={(e) => setKidneyLevel(Number(e.target.value))}
                                    className="w-full appearance-none bg-transparent text-gray-700 focus:outline-none font-bold"
                                >
                                    <option value={0} >
                                    เลือกระดับโรคไต
                                    </option>
                                    <option value={1}>ระยะที่ 1</option>
                                    <option value={2}>ระยะที่ 2</option>
                                    <option value={3}>ระยะที่ 3</option>
                                    <option value={4}>ระยะที่ 4</option>
                                    <option value={5}>ระยะที่ 5</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    
                                </div>
                                {kidneyLevel === 0 ?
                                    <p className="text-sm text-gray-500 mt-2">
                                    เช่น ระยะที่ 1, ระยะที่ 2, ระยะที่ 3, เป็นต้น
                                    </p>
                                :
                                    <></>}
                                
                            </div>
                            
                        </div>




                        {/* ฟอกไต */}
                        <div className="flex text-[#BD4B04] font-bold text-body1 mb-1">เคยฟอกไตหรือไม่</div>
                        <div className="flex relative w-full flex-col mb-20">
                            <div className="flex absolute w-full min-h-16 rounded-xl border border-grey300 bg-sec">
                                <div 
                                    className={`flex w-1/2 rounded-xl m-1  justify-center items-center text-body1 ${
                                        !dialysis ? "bg-orange300 text-white drop-shadow-xl transition-colors duration-300 ease-in-out" : "bg-sec text-gray-800 transition-colors duration-300 ease-in-out"
                                        }`}
                                    onClick={() => setDialysis(false)}>
                                ยังไม่ฟอก
                                </div>
                                <div 
                                    className={`flex w-1/2 rounded-xl m-1 justify-center items-center text-body1 ${
                                        dialysis  ? "bg-orange300 text-white drop-shadow-xl transition-colors duration-300 ease-in-out" : "bg-sec text-gray-800 transition-colors duration-300 ease-in-out"
                                        }`}
                                    onClick={() => setDialysis(true)}>
                                ฟอกแล้ว
                                </div>
                            </div>
                        </div>



                        {/* วันเดือนปีเกิด */}
                        <div className="mb-4">
                            <label htmlFor="birthdate" className="block text-[#BD4B04] font-bold text-body1 mb-1">
                                    วันเดือนปีเกิด
                            </label>
                            <input
                            type="date"
                            id="birthdate"
                            value={birthdate.split("T")[0]}
                            onChange={(e) => {
                                handleBirthdateChange(e);
                                handleBirthdatetoISO(e);
                            }} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        {/* อายุ */}
                        <div className="mb-4">
                            <label htmlFor="age" className="block text-[#BD4B04] font-bold text-body1 mb-1">
                            อายุ (ปี)
                            </label>
                            <input
                            type="number"
                            id="age"
                            value={age}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        {/* ส่วนสูง */}
                        <div className="mb-4">
                            <label htmlFor="height" className="block text-[#BD4B04] font-bold text-body1 mb-1">
                            ส่วนสูง (ซม.)
                            </label>
                            <input
                            type="number"
                            id="height"
                            value={height === 0 ? "" : height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        {/* น้ำหนัก */}
                        <div className="mb-6">
                            <label htmlFor="weight" className="block text-[#BD4B04] font-bold text-body1 mb-1">
                            น้ำหนัก (กก.)
                            </label>
                            <input
                            type="number"
                            id="weight"
                            value={weight === 0 ? "" : weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        {/* ปุ่มถัดไป */}
                        <button
                            onClick={() => setStatePage(1)}
                            disabled={name === "" || birthdate === "" || kidneyLevel === 0 || height === 0 || weight === 0}
                            className="flex w-full bg-[#FF7E2E] text-white justify-center items-center font-bold py-2 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            ถัดไป
                        </button>

                </main>
            </div>
        </div>
        }

        {statePage === 1 && <StatePage1 statePage={statePage}
                                        setStatePage={setStatePage}
                                        setSelectCondition={setSelectCondition}
                                        selectCondition={selectCondition}
                                        />}

        {statePage === 2 && <StatePage2 statePage={statePage}
                                        setStatePage={setStatePage}
                                        selectCondition={selectCondition}
                                        setSelectCondition={setSelectCondition}
                                        name={name}
                                        birthdate={birthdate}
                                        weight={weight}
                                        height={height}
                                        gender={gender}
                                        kidneyLevel={kidneyLevel}
                                        dialysis={dialysis}
                                        userUid={userUid}
                                        userProfile={userProfile}
                                        />}
    </>
    );
    }