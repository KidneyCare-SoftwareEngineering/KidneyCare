"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/Components/Navbar";
import {ProfileHistory} from "@/Components/ProfileHistory";
import SumCalorie from "@/Components/SumCalorie";
import FoodHistory from "@/Components/FoodHistory";
import liff from "@line/liff";

export default function History() {
  const [userUid, setUserUid] = useState<string>("");
  const [userProfile, setUserProfile] = useState<string>("");
  const [userDisplayname, setUserDisplayname] = useState<string>("");
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

  if (!userUid) return <></>
  return (
    <section className="bg-sec">
      <Navbar />
      <ProfileHistory 
        userUid={userUid}
        userProfile={userProfile}
        userDisplayname={userDisplayname}
        />
      <SumCalorie />
      <div className="flex justify-center items-center rounded-lg border border-gray-300 bg-white drop-shadow-lg p-2 mx-4 my-6">
        <p className="font-semibold text-gray-800">ประวัติการกิน</p>
      </div>
      <FoodHistory />
    </section>
  );
}
