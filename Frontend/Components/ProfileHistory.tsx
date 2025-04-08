'use client'
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { UserInformation } from "@/Interfaces/UserInformation";
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export const ProfileHistory: React.FC<{ userUid: string; userProfile: string; userDisplayname: any; userData: UserInformation;}> = ({ userUid, userProfile, userDisplayname, userData }) => {
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);


  const toggleOptions = () => {
    setIsOptionsVisible(!isOptionsVisible);
  };
  

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
                  <p>
                    {userData && userData.gender === "Male" ? 
                    (<>ชาย</>) : (<>หญิง</>)}
                  </p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">วันเกิด:</h2>
                    <p>{userData?.birthdate ? `${userData.birthdate.slice(8, 10)}/${userData.birthdate.slice(5, 7)}/${Number(userData.birthdate.slice(2, 4) + 543)}` : <></>}</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">ส่วนสูง:</h2>
                  <p>{userData?.height}</p>
                </div>
              </div>

              {/* คอลัมน์ขวา */}
              <div className="space-y-2">
                <div className="flex">
                  <h2 className="mr-2">ระดับโรคไต:</h2>
                  <p>{userData?.kidney_level}</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">อายุ:</h2>
                  <p>{userData?.age} ปี</p>
                </div>
                <div className="flex">
                  <h2 className="mr-2">น้ำหนัก:</h2>
                  <p>{userData?.weight} กก.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
