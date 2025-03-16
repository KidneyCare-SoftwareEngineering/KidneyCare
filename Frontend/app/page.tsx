'use client'
import { useEffect, useState } from "react";
import liff from "@line/liff";



 
export default function Home() {
  const [lineImagesrc, setLineImagesrc] = useState("");
  const [userName, setUserName] = useState("");
  const [userUid, setUserUid] = useState("");

  
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: "2006794580-ZJx18Yj9" });
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
        setUserName(profile.displayName);
        setUserUid(profile.userId);
        setLineImagesrc(profile.pictureUrl || ""); 

      } catch (error) {
        console.error("Error fetching profile: ", error);
      }
    }; 
    initLiff();
  }, []);

  const handleLogout = async() => {
    liff.logout();
    window.location.reload();
  }



  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col">
          Loading

          <div className="flex flex-col">
            {lineImagesrc ? (
            <img src={lineImagesrc} alt="Profile" className="rounded-full w-32 h-32" />
            ) : (
              <p>Loading...</p>
            )}
          
            <div className="text-xl">Hello {userName} </div>
            <div className="text-xl">UID: {userUid}</div>

            <button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Logout</button>
          </div>
        </div>
      </main>
    
    </div>
  );
}
