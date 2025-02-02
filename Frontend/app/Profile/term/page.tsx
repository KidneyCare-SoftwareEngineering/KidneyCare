import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-md mx-auto p-6 bg-[#F8F4F1] min-h-screen">
      {/* Header */}
      <h1 className="text-[36px] font-normal text-[#BD4B04] mb-4">
        ข้อกำหนดและเงื่อนไขการใช้งานและนโยบาย
        คุ้มครองข้อมูลส่วน
        บุคคล
      </h1>
      

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4">
        การใช้งานแอปพลิเคชันและประมวลผลหรือข้อมูลส่วนบุคคล
        และการใช้งาน kidneycare
      </p>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        {/* Main text */}
        <p className="text-gray-600 text-sm mb-6">
          โปรดอ่านและทำความเข้าใจใน{' '}
          <span className="text-orange-500">ข้อกำหนดและ
          เงื่อนไขการใช้บริการ</span> และ <span className="text-orange-500">นโยบายการคุ้มครอง
          ข้อมูลส่วนบุคคล</span> ก่อนใช้บริการ kidneycare 
          คุณยินยอมให้ประมวล ใช้ข้อมูล "ตกลง" จากนี้เพื่อยืนยัน
          ว่าได้อ่าน ทำความเข้าใจ และตกลงให้ข้อกำหนด
          และเงื่อนไขการใช้งาน และ นโยบายการคุ้มครอง
          ข้อมูลส่วน บุคคลดังกล่าวสำหรับบริการ kidneycareแล้ว
        </p>

        {/* Checkboxes */}
        <div className="space-y-4 mb-6">
          <label className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" />
            <span className="text-sm text-gray-700">
              ข้าพเจ้ายอมรับข้อกำหนดและเงื่อนไขการใช้บริการ
            </span>
          </label>
          
          <label className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" />
            <span className="text-sm text-gray-700">
              ข้าพเจ้ายอมรับนโยบายการคุ้มครองข้อมูลส่วนบุคคล
            </span>
          </label>

          <label className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" />
            <span className="text-sm text-gray-700">
            ข้าพเจ้ายินยอมโดยชัดแจ้งให้มีการประมวลผลข้อมูลส่วนบุคคลที่มีความ อ่อนไหวรวมถึงแต่ไม่จำกัดอยู่ เพียง น้ำ หนัก ส่วนสูงค่าดัชนีมวลกาย (BMI) โรคประจำตัว อาหารที่แพ้ เป้าหมายน้ำหนักตัว
            เกี่ยว กับน้ำหนักและข้อมูลสุขภาพอื่น ๆ ซึ่ง ข้าพเจ้าอาจทำการเปิดเผย หรือบันทึกไว้บนบริการ kidneycareเพื่อให้บริการ แก่ข้าพเจ้าในการบันทึก ข้อมูลการประมวลผลการวิเคราะห์ และ/หรือการ ให้คำแนะนำตามขอบเขตการให้บริการของบริการ kidneycare
            </span>
          </label>

        </div>

        {/* Submit Button */}
        <button className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors">
          ตกลง
        </button>
      </div>
    </div>
  );
};
export default TermsAndConditions;