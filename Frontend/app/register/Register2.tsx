'use client';
import React, { useState } from "react";
import TitleBarStatePage from "@/Components/TitleBarStatePage";
import Checkbox from '@mui/material/Checkbox';
 

const Register2: React.FC<any> = (data_) => {

  const [selectedDisease, setSelectedDisease] = useState<number[]>([]); 
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]); 


  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, value: number) => {
    if (event.target.checked) {
      setSelectedDisease((prevSelected) => [...prevSelected, value]);
    } else {
      setSelectedDisease((prevSelected) => prevSelected.filter((item) => item !== value));
    }
  };



  const handleCheckboxChange2 = (event: React.ChangeEvent<HTMLInputElement>, value: number) => {
    if (event.target.checked) {
      setSelectedAllergies((prevSelected) => [...prevSelected, value]);
    } else {
      setSelectedAllergies((prevSelected) => prevSelected.filter((item) => item !== value));
    }
  };


  const user_line_id = "fjdsiofjs"

  const datatoback = {
    user_line_id: user_line_id,
    name: data_.name,
    birthdate: data_.birthdate,
    weight: parseInt(data_.weight),
    height: parseInt(data_.height),
    gender: data_.gender,
    kidney_level: parseInt(data_.kidneyLevel),
    kidney_dialysis: data_.dialysis,
    users_food_condition: data_.selectCondition,
    user_disease:  selectedDisease, 
    users_ingredient_allergies: selectedAllergies
  }
  console.log(datatoback)
  const handleRegister = async() => {
    await fetch('http://127.0.0.1:7878/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datatoback),
    });
  };


  return(
    <>
      <div className="flex w-screen min-h-screen flex-col items-center bg-sec">
        <TitleBarStatePage title="ข้อมูลส่วนตัว" statePage={data_.statePage} setStatePage={data_.setStatePage}/>
        <main className="flex flex-col bg-white rounded-2xl shadow-lg px-8 py-6 w-11/12 max-w-md mx-auto my-6 mt-4">
          <header className="mb-6">
            <h1 className="text-heading3 font-bold text-gray-800">ระบุข้อมูลสุขภาพของคุณ</h1>
            <h1 className="text-body1 font-bold text-orange400 mt-4">โรคหรืออาการที่เป็นอยู่</h1>
            <h1 className="text-body3 text-grey300">หากไม่มีโรคหรืออาการอื่นๆสามารถเว้นว่างได้</h1>
          </header>

              <form>
                {/* โรคหรืออาการที่เป็นอยู่ */}
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(1)}
                    onChange={(e) => handleCheckboxChange(e, 1)}
                  /> โรคติดเชื้อระบบทางเดินปัสสาวะส่วนบน
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(2)}
                    onChange={(e) => handleCheckboxChange(e, 2)}
                  /> โรคทางเดินหัวใจ และหลอดเลือด
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(3)}
                    onChange={(e) => handleCheckboxChange(e, 3)}
                  /> โรคติดเชื้อในระบบต่างๆ
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(4)}
                    onChange={(e) => handleCheckboxChange(e, 4)}
                  /> โรคความดันโรหิตสูง
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(5)}
                    onChange={(e) => handleCheckboxChange(e, 5)}
                  /> โรคแพ้ภูมิตัวเอง
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(6)}
                    onChange={(e) => handleCheckboxChange(e, 6)}
                  /> โรคเบาหวาน
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedDisease.includes(7)}
                    onChange={(e) => handleCheckboxChange(e, 7)}
                  /> โรคเก๊าท์
                </div>


                <div className="mb-6">
                  <h1 className="text-body1 font-bold text-orange400 mt-4">อาหารหรือของกินที่แพ้</h1>
                  <h1 className="text-body3 text-grey300">หากไม่มีอาหารที่แพ้สามารถเว้นว่างได้</h1>
                </div>

                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(1)}
                    onChange={(e) => handleCheckboxChange2(e, 1)}
                  /> โรคติดเชื้อระบบทางเดินปัสสาวะส่วนบน
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(2)}
                    onChange={(e) => handleCheckboxChange2(e, 2)}
                  /> โรคทางเดินหัวใจ และหลอดเลือด
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(3)}
                    onChange={(e) => handleCheckboxChange2(e, 3)}
                  /> โรคติดเชื้อในระบบต่างๆ
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(4)}
                    onChange={(e) => handleCheckboxChange2(e, 4)}
                  /> โรคความดันโรหิตสูง
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(5)}
                    onChange={(e) => handleCheckboxChange2(e, 5)}
                  /> โรคแพ้ภูมิตัวเอง
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(6)}
                    onChange={(e) => handleCheckboxChange2(e, 6)}
                  /> โรคเบาหวาน
                </div>
                <div className="flex w-full justify-start items-center text-body2">
                  <Checkbox
                    color="success"
                    checked={selectedAllergies.includes(7)}
                    onChange={(e) => handleCheckboxChange2(e, 7)}
                  /> โรคเก๊าท์
                </div>

                {/* ปุ่มบันทึก */}
                <div
                  onClick={() => handleRegister()}
                  className="flex w-full bg-[#FF7E2E] mt-4 justify-center items-center text-white font-bold py-2 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  บันทึก
                </div>
              </form>
        </main>


      </div>
      
    </>
  )
}

export default Register2