'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '@/Components/Navbar'
import SearchFoodBox from '@/Components/SearchFoodBox'
import SearchBox from '@/Components/SearchBox'
import liff from '@line/liff'
import Food from '@/Interfaces/FoodInterface'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet"

export default function SearchFood() {

  const [lineImagesrc, setLineImagesrc] = useState("");
  const [userName, setUserName] = useState("");
  const [userUid, setUserUid] = useState("");
  const [foodData, setFoodData] = useState<Food[]>([]);
  const [filteredFoodData, setFilteredFoodData] = useState<Food[]>([]);

  // useEffect(() => {
  // const initLiff = async () => {
  //   try {
  //     await liff.init({ liffId: "2006794580-ZJx18Yj9" });
  //     if (!liff.isLoggedIn()) {
  //       liff.login(); 
  //     }
  //     else{
  //       console.log("User is logged in", liff.isLoggedIn());
  //     }
  //   } catch (error) {
  //     console.error("Error initializing LIFF: ", error);
  //   }
  //   try {
  //     const profile = await liff.getProfile();
  //     setUserName(profile.displayName);
  //     setUserUid(profile.userId);
  //     setLineImagesrc(profile.pictureUrl || ""); 

  //   } catch (error) {
  //     console.error("Error fetching profile: ", error);
  //   }
  // }; 
  // initLiff();
  // }, []);

useEffect(() => {
  // if (liff.isLoggedIn() === false)
    fetch(`http://127.0.0.1:7878/food_cards`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setFoodData(data)
      })
      .catch(error => {
        console.error('Error fetching user data:', error)

      })
    }, [])


    const handleSearch = (searchTerm: string) => {
      if (searchTerm.trim() === '') {
        setFilteredFoodData(foodData);
      } else {
        const filtered = foodData.filter(food => 
          // เผื่อเมนูeng
          food.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFoodData(filtered);
      }
    };
  

  return (
    <>
      <div className="flex h-full max-w-3/6 justify-start gap-5 items-center flex-col bg-background min-h-screen pb-8">

    
        <Navbar />
        <SearchBox onSearch={handleSearch} />
        {
          !filteredFoodData.length ? (
          <>
            {foodData.map((food) => (
              <SearchFoodBox key={food.id} food={food} />
            ))}
          </>
          ) : (
          <>
            {filteredFoodData.map((food) => (
              <SearchFoodBox key={food.id} food={food} />
            ))}
          </>
          )
        }


        
      </div>
    </>

  )
}
