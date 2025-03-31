"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export const ProfileHistory: React.FC<{ userUid: string; userProfile: string; userDisplayname}> = ({ userUid, userProfile, userDisplayname }) => {
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleOptions = () => {
    setIsOptionsVisible(!isOptionsVisible);
  };
  console.log(userProfile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsVisible(false);
      }
    };

    const handleScroll = () => {
      setIsOptionsVisible(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="p-4">
        <div className="pb-4 text-center bg-white drop-shadow-lg rounded-lg relative">
          {/* ปก */}
          <div className="relative h-24 bg-black rounded-t-lg overflow-hidden">
            <img
              className="object-cover w-full h-full rounded-t-lg opacity-50"
              src={`${userProfile}`}
              alt="Profile Banner"
            />
            {/* ปุ่มสามจุด */}
            <button
              ref={buttonRef}
              onClick={toggleOptions}
              className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white"
            >
              <Icon icon="mdi:dots-vertical" />
            </button>
            {isOptionsVisible && (
              <div
                ref={optionsRef}
                className="absolute top-10 right-2 p-2 bg-white rounded-lg shadow-lg"
              >
                <button className="flex items-center text-sm text-gray-700">
                  <Icon icon="material-symbols:edit-outline" className="mr-2" />
                  แก้ไข
                </button>
              </div>
            )}
          </div>

          {/* โปรไฟล์ */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
            <img
              className="w-24 h-24 rounded-full"
              src={`${userProfile}`}
              alt="Profile"
            />
          </div>

          {/* ข้อมูล */}
          <div className="mt-16 px-8">
            <h2 className="text-lg font-semibold">{`${userDisplayname}`}</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* คอลัมน์ซ้าย */}
              <div className="space-y-2">
                <div className="flex">
                  <h2 className="mr-2">เพศ:</h2>
                  <p>ชาย</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">วันเกิด:</h2>
                  <p>01/01/2000</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">ส่วนสูง:</h2>
                  <p>157 ซม.</p>
                </div>
              </div>

              {/* คอลัมน์ขวา */}
              <div className="space-y-2">
                <div className="flex">
                  <h2 className="mr-2">ระดับโรคไต:</h2>
                  <p>3</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">อายุ:</h2>
                  <p>21 ปี</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">น้ำหนัก:</h2>
                  <p>46 กก.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
