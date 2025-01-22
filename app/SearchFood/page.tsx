import React from 'react'
import Navbar from '@/Components/Navbar'
import SearchFoodBox from '@/Components/SearchFoodBox'
import SearchBox from '@/Components/SearchBox'


const foodData = [
  {
    id: 1,
    name: "สลัดอกไก่ย่าง",
    calories: 150,
    protein: 13,
    carbs: 4,
    fat: 4,
    sodium: 4,
    phosphorus: 4,
    potassium: 4,
    imageUrl: "https://picsum.photos/200"
  },
  {
    id: 2,
    name: "ข้าวมันไก่",
    calories: 200,
    protein: 20,
    carbs: 25,
    fat: 6,
    sodium: 10,
    phosphorus: 5,
    potassium: 5,
    imageUrl: "https://picsum.photos/201"
  },
  {
    id: 3,
    name: "ข้าวมันไก่",
    calories: 200,
    protein: 20,
    carbs: 25,
    fat: 6,
    sodium: 10,
    phosphorus: 5,
    potassium: 5,
    imageUrl: "https://picsum.photos/201"
  },
  {
    id: 4,
    name: "ข้าวมันไก่",
    calories: 200,
    protein: 20,
    carbs: 25,
    fat: 6,
    sodium: 10,
    phosphorus: 5,
    potassium: 5,
    imageUrl: "https://picsum.photos/201"
  },
]


export default function SearchFood() {
  return (
    <>
      <div className="flex h-full max-w-3/6 justify-start gap-5 items-center flex-col bg-background min-h-screen pb-8">
        <Navbar />
        <SearchBox />
        {foodData.map((food) => (
          <SearchFoodBox key={food.id} food={food} />
        ))}
      </div>
    </>

  )
}
