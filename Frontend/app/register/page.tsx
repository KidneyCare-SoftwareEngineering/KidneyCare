'use client'
import Link from 'next/link';
import React from 'react';
import { useState,useEffect } from 'react';
import liff from '@line/liff';


const TermsAndConditions = () => {

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptSensitiveData, setAcceptSensitiveData] = useState(false);
  const [userUid, setUserUid] = useState("");

  const isFormValid = acceptTerms && acceptPrivacy && acceptSensitiveData;

  // Line LIFF
    useEffect(() => {
        const initLiff = async () => {
            try {
            await liff.init({ liffId: "2006794580-LqqJQNDn" });
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
                console.log("userUid", profile.pictureUrl);
    
            } catch (error) {
                console.error("Error fetching profile: ", error);
            }
        }; 
        initLiff();
        }, []);
    // ---------------------------------



  return (
    <div className="flex flex-col w-screen max-w-md mx-auto p-6 bg-[#F8F4F1] min-h-screen">
      {/* Header */}
      <h1 className="flex text-heading1 font-normal text-searchcalories mb-4">
        ข้อกำหนดและเงื่อนไขการใช้งานและนโยบาย
        คุ้มครองข้อมูลส่วน
        บุคคล
      </h1>
      

      {/* Description */}
      <p className="text-black text-body2 mb-4">
        การให้ความยินยอมในการประมวลผลหรือข้อมูลส่วนบุคคล
        และการใช้งาน kidneycare
      </p>

      <div className="flex w-full flex-col max-w-md bg-white rounded-xl shadow-lg p-6">
        {/* Main text */}
        <p className="text-gray-600 text-body1f mb-6">
          โปรดอ่านและทำความเข้าใจใน{' '}
          <span className="text-orange400">
            ข้อกำหนดและเงื่อนไขการใช้บริการ
          </span> 
          และ 
          <span className="text-orange400">
            นโยบายการคุ้มครองข้อมูลส่วนบุคคล
          </span> 
          ก่อนใช้บริการ kidneycare 
          คุณยินยอมให้ประมวล ใช้ข้อมูล "ตกลง" จากนี้เพื่อยืนยัน
          ว่าได้อ่าน ทำความเข้าใจ และตกลงให้ข้อกำหนด
          และเงื่อนไขการใช้งาน และ นโยบายการคุ้มครอง
          ข้อมูลส่วน บุคคลดังกล่าวสำหรับบริการ kidneycareแล้ว
        </p>

        {/* Checkboxes */}
        <div className="space-y-4 mb-6">
          <label className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              className="mt-1" 
              checked={acceptTerms} 
              onChange={() => setAcceptTerms(!acceptTerms)} 
            />
            <span className="text-sm text-black">
              ข้าพเจ้ายอมรับข้อกำหนดและเงื่อนไขการใช้บริการ
            </span>
          </label>
          
          <label className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              className="mt-1" 
              checked={acceptPrivacy} 
              onChange={() => setAcceptPrivacy(!acceptPrivacy)} 
            />
            <span className="text-sm text-black">
              ข้าพเจ้ายอมรับนโยบายการคุ้มครองข้อมูลส่วนบุคคล
            </span>
          </label>

          <label className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              className="mt-1" 
              checked={acceptSensitiveData} 
              onChange={() => setAcceptSensitiveData(!acceptSensitiveData)} 
            />
            <span className="text-sm text-black">
            ข้าพเจ้ายินยอมโดยชัดแจ้งให้มีการประมวลผลข้อมูลส่วนบุคคลที่มีความ อ่อนไหวรวมถึงแต่ไม่จำกัดอยู่ เพียง น้ำ หนัก ส่วนสูงค่าดัชนีมวลกาย (BMI) โรคประจำตัว อาหารที่แพ้ เป้าหมายน้ำหนักตัว
            เกี่ยว กับน้ำหนักและข้อมูลสุขภาพอื่น ๆ ซึ่ง ข้าพเจ้าอาจทำการเปิดเผย หรือบันทึกไว้บนบริการ kidneycareเพื่อให้บริการ แก่ข้าพเจ้าในการบันทึก ข้อมูลการประมวลผลการวิเคราะห์ และ/หรือการ ให้คำแนะนำตามขอบเขตการให้บริการของบริการ kidneycare
            </span>
          </label>

        </div>

        {/* Submit Button */}
        {!isFormValid ?
        <div 
          className="flex w-full py-3 justify-center items-center rounded-lg transition-colors bg-gray-200 text-black"
          >
          ตกลง
        </div>
        :
        <a
          href='https://liff.line.me/2006794580-6ZGZ5Eja'
          className="flex w-full py-3 justify-center items-center rounded-lg transition-colors bg-orange300 text-white"
          >
          ตกลง
        </a>
        }
      </div>
    </div>
  );
};
export default TermsAndConditions;