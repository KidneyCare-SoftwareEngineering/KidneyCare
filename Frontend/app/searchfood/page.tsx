'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '@/Components/Navbar'
import SearchFoodBox from '@/Components/SearchFoodBox'
import SearchBox from '@/Components/SearchBox'
import { FoodInterface } from '@/Interfaces/FoodInterface'

export default function SearchFood() {
  // const [lineImagesrc, setLineImagesrc] = useState("");
  // const [userName, setUserName] = useState("");
  // const [userUid, setUserUid] = useState("");
  const [foodData, setFoodData] = useState<FoodInterface[]>([]);
  const [filteredFoodData, setFilteredFoodData] = useState<FoodInterface[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:7878/food_cards`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setFoodData(data)
        setFilteredFoodData(data);
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
        food.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFoodData(filtered);
    }
  };

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
          filteredFoodData.map((food) => (
            <SearchFoodBox key={food.id} food={food} />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            ไม่พบเมนูอาหาร
          </div>
        )}
      </div>
    </>
  )
}
