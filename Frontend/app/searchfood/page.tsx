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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFoodData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFoodData.length / itemsPerPage);

  const genNum = () => {
    const maxVisible = 5;
    const pages = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    }

    if (currentPage + half >= totalPages) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (start > 1) {
      if (start > 2) pages.unshift('...');
      pages.unshift(1);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = genNum();

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
    setIsLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/food_cards`)
      .then(response => response.json())
      .then(data => {
        setFoodData(data)
        setFilteredFoodData(data);
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching user data:', error)
      } 
    )
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  },[filteredFoodData])

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

  if(isLoading) return <div className='flex w-screen h-screen justify-center items-center'> <PuffLoader /> </div>

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
          currentItems.map((food, index) => (
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
          <div className="text-center text-gray-500">
            <img src="Nofoodsearch.png" width={300} height={300} className=" mt-16" />
            <div className="text-heading3">ไม่พบเมนูอาหาร</div>
          </div>
        )}


        
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-500">...</span>
            ) : (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page as number);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-orange300 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      </div>
    </>
  )
}