'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '@/Components/Navbar'
import SearchFoodBox from '@/Components/SearchFoodBox'
import SearchBox from '@/Components/SearchBox'
import liff from '@line/liff'
import { FoodInterface } from '@/Interfaces/Meal_PillInterface'
import PuffLoader from "react-spinners/PuffLoader";
import { motion } from "framer-motion";


export default function SearchFood() {
  const [userUid, setUserUid] = useState("");
  const [foodData, setFoodData] = useState<FoodInterface[]>([]);
  const [filteredFoodData, setFilteredFoodData] = useState<FoodInterface[]>([]);

  // Line LIFF
  useEffect(() => {
      const initLiff = async () => {
        try {
          await liff.init({ liffId: "2006794580-jmO39r8Z" });
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
  
        } catch (error) {
          console.error("Error fetching profile: ", error);
        }
      }; 
      initLiff();
    }, []);
  // ---------------------------------


  

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/food_cards`)
      .then(response => response.json())
      .then(data => {
        setFoodData(data)
        setFilteredFoodData(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error)
      })
  }, [])

  const handleSearch = (searchTerm: string) => {
    if (foodData) {
      if (searchTerm.trim() === '') {
        setFilteredFoodData(foodData);
      } else {
        const filtered = foodData.filter(food =>
          food.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFoodData(filtered);
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.2  
      },
    }),
  };

  // if(!foodData) return <div className='flex w-screen h-screen justify-center items-center'> <PuffLoader /> </div>

  return (
    <>
      <div className="flex h-full max-w-3/6 justify-start gap-5 items-center flex-col bg-sec min-h-screen pb-8">
        <Navbar />
        <SearchBox 
          onSearch={handleSearch}
          foodData={foodData}
          setFilteredFoodData={setFilteredFoodData} 
        />
        
        {filteredFoodData.length > 0 ? (
          filteredFoodData.map((food, index) => (
            <motion.div 
              key={food.id} 
              variants={itemVariants} 
              initial="hidden" 
              animate="visible" 
              custom={index}
              className='flex w-full h-full justify-center'
            >
              <SearchFoodBox key={food.id} food={food} />
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <PuffLoader />
          </div>
        )}
      </div>
    </>
  )
}