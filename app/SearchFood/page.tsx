import React from 'react'
import Navbar from '@/Components/Navbar'
import SearchFoodBox from '@/Components/SearchFoodBox'
import SearchBox from '@/Components/SearchBox'

export default function SearchFood() {
  return (
    <>
      <div className="flex h-full w-screen justify-start gap-5 items-center flex-col bg-background min-h-screen pb-8">
        <Navbar />
        <SearchBox />
        <SearchFoodBox />
        <SearchFoodBox />
        <SearchFoodBox />
        <SearchFoodBox />
        <SearchFoodBox />
      </div>
    </>

  )
}
