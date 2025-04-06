"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/Components/Navbar";
import {ProfileHistory} from "@/Components/ProfileHistory";
import SumCalorie from "@/Components/SumCalorie";
import FoodHistory from "@/Components/FoodHistory";
import liff from "@line/liff";
import { UserInformation } from "@/Interfaces/UserInformation";
import { Meal_planInterface } from "@/Interfaces/Meal_PillInterface";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";


export default function History() {
  const [userUid, setUserUid] = useState<string>("");
  const [userProfile, setUserProfile] = useState<string>("");
  const [userDisplayname, setUserDisplayname] = useState<string>("");
  const [userData, setUserData] = useState<UserInformation>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealPlans, setMealPlans] = useState<Meal_planInterface>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const mealTypes = ["อาหารเช้า", "อาหารกลางวัน", "อาหารเย็น", "ของว่าง"];

  const datatoback = {
    user_line_id: userUid,
    date: selectedDate.toISOString().split("T")[0]  
  }
  const transition = { type: "spring", stiffness: 200, damping: 20 };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition },
    exit: { opacity: 0, y: -20, scale: 0.95, transition },
  };



  // Line LIFF
      useEffect(() => {
          const initLiff = async () => {
              try {
              await liff.init({ liffId: "2006794580-YOMwvde9" });
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
                  setUserProfile(profile.pictureUrl || "https://thumbs.dreamstime.com/b/vector-illustration-isolated-white-background-user-profile-avatar-black-line-icon-user-profile-avatar-black-line-icon-121102131.jpg");
                  setUserDisplayname(profile.displayName || "Loading");
              } catch (error) {
                  console.error("Error fetching profile: ", error);
              }
          }; 
          initLiff();
          }, []);
      // ---------------------------------


      useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_user_info?user_line_id=${userUid}`)
          .then(response => response.json())
          .then(data => {
            setUserData(data)
          })
          .catch(error => {
            console.error('Error fetching user data:', error)
          })
      }, [userUid])

      
      
      
      useEffect(() => {
        const get_meal_plan = async () => {
          // setIsLoading(true)
          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_meal_plan`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(datatoback),
                  });
                  const data = await response.json();
                  setMealPlans(data);
          } catch (error) {
              console.log("error", error)
          } finally{
              // setIsLoading(false)
          }
          
        }; 
        get_meal_plan()
      }, [userUid, selectedDate]);

  
    const handleAlreadyEat = async (id: number) => {
      try {
        const body = {
          meal_plan_recipe_id: id,
          ischecked: true
        }
        console.log(body) // log ตรงนี้
    
        await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/user_already_eat`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
    
      } catch (error) {
        console.log("error", error)
      } finally{
        // setIsLoading(false)
        // window.location.reload()
    }
  }

      


  if (!userUid||!userData) return <></>

  return (
    <div className="bg-sec">

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="flex w-screen flex-col justify-start items-center overflow-y-auto min-h-[70vh] bg-sec rounded-t-xl">
            <SheetHeader>
              <SheetTitle>เพิ่มอาหารมื้อเช้า</SheetTitle>
            </SheetHeader>


              <div className="flex w-screen justify-start items-start text-body1 font-bold ml-8 mt-8">แผนอาหารของฉัน</div>
              {mealPlans?.meal_plans[0]?.recipes
                ?.filter((data) => data.ischecked === false)
                .sort((a, b) => a.meal_time - b.meal_time)
                .map((data, index) => (
                <motion.div
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  key={index}
                  className={`flex w-10/12 justify-center items-center bg-white min-h-24 drop-shadow-md rounded-xl mt-3`}
                >
                  <div className="flex w-4/12 justify-center items-center">
                    <img src={data.recipe_img_link[0]} className="size-24 rounded-full p-2 object-cover"  />
                  </div>
                  <div className="flex w-6/12 p-2 justify-center flex-col">
                    <div className="flex text-body3 text-grey300">{mealTypes[data.meal_time - 1 ]}</div>
                    <div
                      className="flex text-body1 font-bold text-black py-3">
                      {data.recipe_name}
                    </div>
                    <div className="flex text-body3 text-black">
                      {data.calories} กิโลแคลอรี่
                    </div>
                  </div>
                  <div className="flex w-2/12 items-center justify-center">
                    <div
                      onClick={() => handleAlreadyEat(data.meal_plan_recipe_id)}
                      className="flex space-x-2flex items-center size-10 rounded-full justify-center bg-orange75 p-2">
                      <Icon
                        icon="ic:baseline-plus"
                        className="text-orange300 w-5 h-5"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            
            
        </SheetContent>
      </Sheet>


      <Navbar />
      <ProfileHistory 
        userUid={userUid}
        userProfile={userProfile}
        userDisplayname={userDisplayname}
        userData={userData}
        />
      <SumCalorie 
        userUid={userUid}
        userData={userData}
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        mealPlans={mealPlans || {} as Meal_planInterface}
      />
      <div className="flex justify-center items-center rounded-lg border border-gray-300 bg-white drop-shadow-lg p-2 mx-4 my-6">
        <p className="font-semibold text-gray-800">ประวัติการกิน</p>
      </div>
      <FoodHistory 
        mealPlans={mealPlans || {} as Meal_planInterface}
        userUid={userUid}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        />

      
    </div>
  );
}
