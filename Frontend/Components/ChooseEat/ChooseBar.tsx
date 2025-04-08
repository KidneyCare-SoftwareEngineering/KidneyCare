'use client'
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Meal_planInterface, MedicineData, recipesInterface, FoodInterface } from "@/Interfaces/Meal_PillInterface";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";
import SearchFoodBox from "@/Components/SearchFoodBox";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBox from "@/Components/SearchBox";
import ChooseFood from "./ChooseFood_Edit/page";
import { UserInformation } from "@/Interfaces/UserInformation";
import Portal from "./Portal";


const ChooseBar: React.FC<{MealPlans: Meal_planInterface, desc: string, isEdit: boolean, setIsEdit: React.Dispatch<React.SetStateAction<boolean>>; userUid: string; setIsLoading: (value: boolean) => void}> = ({ MealPlans, desc, isEdit, setIsEdit, userUid, setIsLoading}) => {
  const [foodData, setFoodData] = useState<FoodInterface[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filteredFoodData, setFilteredFoodData] = useState<FoodInterface[]>([]);
  const [chooseFood, setChooseFood] = useState<boolean>(false);
  const [foodChoosed, setFoodChoosed] = useState<number>();
  const [foodChoosedData, setFoodChoosedData] = useState<FoodInterface | null>(null);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [localMealPlans, setLocalMealPlans] = useState<Meal_planInterface>(MealPlans);
  const [editItem, setEditItem] = useState<recipesInterface[]>([]);
  const [mergeItems, setMergeItems] = useState<recipesInterface[]>([]);
  const [userData, setUserData] = useState<UserInformation>()

  // Aniamtion
  const transition = { type: "spring", stiffness: 200, damping: 20 };
  const containerVariants = {
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition },
    exit: { opacity: 0, y: -20, scale: 0.95, transition },
  };


  // Food|Pill Check and status
  const isMedicine = desc === "ยา";
  const [allItems, setAllItems] = useState<recipesInterface[]>(() => 
    isMedicine 
      ? localMealPlans.medicines || [] 
      : localMealPlans.meal_plans[0].recipes || []
  );
  useEffect(() => {
      setAllItems(isMedicine 
        ? localMealPlans.medicines || [] 
        : localMealPlans.meal_plans[0].recipes || []);
    }, [localMealPlans, isMedicine]);
  const eatenItems = isMedicine 
    ? allItems.filter(item => item.ischecked) 
    : allItems.filter(item => item.ischecked);
  const notEatenItems = isMedicine 
    ? allItems.filter(item => !item.ischecked) 
    : allItems.filter(item => !item.ischecked);
  const mealTypes = ["อาหารเช้า", "อาหารกลางวัน", "อาหารเย็น", "ของว่าง"];


  useEffect(() => {
    if (!isMedicine) {
      const total = eatenItems.reduce((sum, food) => sum + food.calories, 0);
      setTotalCalories(total);
    }
  }, [eatenItems, isMedicine]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/food_cards`)
      .then(response => response.json())
      .then(data => {
        setFoodData(data);
        setFilteredFoodData(data);
      })
      .catch(error => {
        console.error('Error fetching food data:', error);
      });
  }, []);

  

  // ทำเครื่องหมายว่ากินแล้ว
  const handleEaten = async (item: recipesInterface) => {
    try {
      const updatedMealPlans = {...localMealPlans};
    
      if (isMedicine && updatedMealPlans.medicines) {
        updatedMealPlans.medicines = updatedMealPlans.medicines.map(med => 
          med.user_medicine_id === item.user_medicine_id ? {...med, ischecked: true} : med
        );
      } else if (!isMedicine && updatedMealPlans.meal_plans[0].recipes) {
        updatedMealPlans.meal_plans[0].recipes = updatedMealPlans.meal_plans[0].recipes.map(recipe => 
          recipe.meal_plan_recipe_id === item.meal_plan_recipe_id ? {...recipe, ischecked: true} : recipe
        );
      }
      
      setLocalMealPlans(updatedMealPlans);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/user_already_eat`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_plan_recipe_id: item.meal_plan_recipe_id,
          ischecked: true,
        }),
      });
    } catch (error) {
      console.log("Error marking item as eaten:", error);
      setLocalMealPlans(MealPlans);
    } 
  };



 

  // ทำเครื่องหมายว่ายังไม่กิน
  const handleNotEaten = async (item: recipesInterface) => {
    try {
      const updatedMealPlans = {...localMealPlans};
    
      if (isMedicine && updatedMealPlans.medicines) {
        updatedMealPlans.medicines = updatedMealPlans.medicines.map(med => 
          med.user_medicine_id === item.user_medicine_id ? {...med, ischecked: false} : med
        );
      } else if (!isMedicine && updatedMealPlans.meal_plans[0].recipes) {
        updatedMealPlans.meal_plans[0].recipes = updatedMealPlans.meal_plans[0].recipes.map(recipe => 
          recipe.meal_plan_recipe_id === item.meal_plan_recipe_id ? {...recipe, ischecked: false} : recipe
        );
      }
      
      setLocalMealPlans(updatedMealPlans);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/user_already_eat`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_plan_recipe_id: item.meal_plan_recipe_id,
          ischecked: false,
        }),
        
      });
    
    } catch (error) {
      console.log("Error marking item as not eaten:", error);
      setLocalMealPlans(MealPlans);
    } 
  };

  

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


  const handleChooseFood = (id: number) => {
    setFoodChoosed(id);
    setChooseFood(true);
    setIsSheetOpen(false);
  };


  useEffect(() => {
    const newItem: recipesInterface = {
      recipe_id: foodChoosedData?.id || 0,
      recipe_name: foodChoosedData?.recipe_name || "",
      recipe_img_link: foodChoosedData?.image_url ? [foodChoosedData.image_url] : [],
      ischecked: false,
      meal_time: 1,
      calories: foodChoosedData?.calories || 0,
    }

    setEditItem(prev => [...prev, newItem])
    setMergeItems([...allItems, ...editItem, newItem])

    

  },[foodChoosedData])

  

  const handleDelete = (item: recipesInterface) => {
    const updatedMergeItems = mergeItems.filter(recipe => recipe.meal_plan_recipe_id !== item.meal_plan_recipe_id);
    const updatedAllItems = allItems.filter(recipe => recipe.meal_plan_recipe_id !== item.meal_plan_recipe_id);
    const updatedEditItems = editItem.filter(recipe => recipe.meal_plan_recipe_id !== item.meal_plan_recipe_id);

    setMergeItems(updatedMergeItems);
    setAllItems(updatedAllItems);
    setEditItem(updatedEditItems);
  };
  

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



  const handleSaveMealPlan_Edit = async () => {
    try {
      setIsLoading(true)
      const dataforAPI = {
        user_line_id: userUid,
        date: MealPlans.meal_plans[0].date,
        recipes: mergeItems
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/edit_meal_plan`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(dataforAPI),
      });
      const data = await response.json();
      console.log("dataforedit",dataforAPI)
      console.log (data)
    }
    catch (error) {
        console.log("error", error);
    }finally{
      setIsLoading(false)
      window.location.reload();
    }

    setLocalMealPlans(prev => ({
      ...prev,
      meal_plans: prev.meal_plans.map((mealPlan, index) =>
        index === 0 
          ? { 
              ...mealPlan, 
              recipes: [
                ...mealPlan.recipes, 
                ...editItem.map(item => ({
                  ...item,
                  meal_plan_recipe_id: item.meal_plan_recipe_id ?? 0 
                }))
              ] 
            }
          : mealPlan
      )
    }));
    setIsEdit(false);
  };



  const renderItem = (item: recipesInterface, isEaten: boolean) => {
    if (isMedicine) {
      return (
        <motion.div
          layout
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`flex w-10/12 ${isEaten ? 'bg-grey200 border border-grey300' : 'bg-white'} min-h-24 drop-shadow-md rounded-xl mt-3`}
        >
          <Link href={`/pillreminder/${isEaten ? 'pildetail' : 'pilldetail'}/${item.user_medicine_id}`} className="flex w-4/12 justify-center items-center">
            <img src="https://picsum.photos/200/300" className="size-24 rounded-full p-2" alt="Medicine" />
          </Link>
          <div className="flex w-6/12 p-2 justify-center flex-col">
            <div className="flex text-body3 text-grey300">
              เวลา {item.medicine_schedule?.[0]?.split("T")[1]?.slice(0, 5) || ""} น.
            </div>
            <Link href={`/pillreminder/${isEaten ? 'pildetail' : 'pilldetail'}/${item.user_medicine_id}`}
              className="flex text-body1 font-bold text-black py-3">
              {item.medicine_name}
            </Link>
            <div className="flex text-body3 text-black">
              จำนวน {item.medicine_per_times} {item.medicine_unit}
            </div>
          </div>
          <div
            onClick={() => isEaten ? handleNotEaten(item) : handleEaten(item)}
            className="flex w-2/12 justify-center items-center">
            {isEaten ? (
              <div className="flex size-6 rounded-full bg-grey500 justify-center items-center">
                <Icon icon="material-symbols:check-rounded" className="text-white size-5" />
              </div>
            ) : (
              <div className="flex size-6 rounded-full border-2 border-orange300"></div>
            )}
          </div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          layout
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`flex w-10/12 ${isEaten ? 'bg-grey200 border border-grey300' : 'bg-white'} min-h-24 drop-shadow-md rounded-xl mt-3 z-1`} //มันบัคซ้อนหน้าอื่นตอน Deploy
        >
          {!isEdit ? (
            <Link href={`/fooddetail/${item.recipe_id}`} className="flex w-4/12 justify-center items-center">
              <img src={`${item.recipe_img_link}`} alt="food" className="size-24 rounded-full p-2 object-cover" />
            </Link>
          ) : (
            <div className="flex w-4/12 justify-center items-center">
              <img src={`${item.recipe_img_link}`} alt="food" className="size-24 rounded-full p-2 object-cover" />
            </div>
          )}
          <div className="flex w-6/12 p-2 justify-center flex-col">
            <div className="flex text-body3 text-grey300">
              {mealTypes[item.meal_time - 1 ]}
            </div>
            {!isEdit ? (
              <Link href={`/fooddetail/${item.recipe_id}`}
                className="flex text-body1 font-bold text-black py-3 line-clamp-1">
                {item.recipe_name}
              </Link>
            ) : (
              <div className="flex text-body1 font-bold text-black py-3 line-clamp-1">
                {item.recipe_name}
              </div>
            )}
            <div className="flex text-body3 text-black">
              {item.calories} <p className="text-grey300"> &nbsp;กิโลแคลอรี่</p>
            </div>
          </div>
          

          {isEdit ? (
            <div
            onClick={() => handleDelete(item)}
            className="flex w-2/12 justify-center items-center">
                <Icon icon="mdi:trash" className="text-black size-5" />
            </div>
          ) : (
            isEaten ? (
              <div
              onClick={() => isEaten ? handleNotEaten(item) : handleEaten(item)}
              className="flex w-2/12 justify-center items-center">
                <div className="flex size-6 rounded-full bg-grey500 justify-center items-center">
                  <Icon icon="material-symbols:check-rounded" className="text-white size-5" />
                </div>
              </div>
            ) : (
              <div
              onClick={() => isEaten ? handleNotEaten(item) : handleEaten(item)}
              className="flex w-2/12 justify-center items-center">
                <div className="flex size-6 rounded-full border-2 border-orange300"/>
              </div>
            )
          )}


        </motion.div>
      );
    }
  };

  useEffect(() => {
    setEditItem([]);
    setMergeItems([...allItems])
  },[])





  return (
    <div className='flex w-full h-full flex-col items-center mt-3 relative'>

    {notEatenItems.length > 0 && (
      <div className="flex bg-white w-10/12 justify-center items-center rounded-xl drop-shadow-xl mt-6 py-3 text-body2 font-bold">
        {desc}ที่ต้องรับประทาน
      </div>
    )}


      {chooseFood && foodChoosed !== undefined && (
        <Portal>
          <div className="fixed w-screen h-screen inset-0 bg-white z-50">
            <ChooseFood id={foodChoosed} setChooseFood={setChooseFood} setFoodChoosedData={setFoodChoosedData} setIsSheetOpen={setIsSheetOpen} />
          </div>
        </Portal>
      )}

      
      <AnimatePresence mode="popLayout">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col w-full items-center z-1"
        >
          
          {isEdit ? 
            mergeItems
              .map((item, index) => (
              <React.Fragment key={index}>
                {renderItem(item, false)}
              </React.Fragment>
            ))
            :
            notEatenItems
              .sort((a, b) => a.meal_time - b.meal_time)
              .map((item, index) => (
              <React.Fragment key={index}>
                {renderItem(item, false)}
              </React.Fragment>
            ))
            }

          
        </motion.div>
      </AnimatePresence>





      {/* edit popup */}
      {isEdit && (
        
          <>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger className="flex border border-grey300 justify-center items-center w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3 z-1">
            <Icon icon="mdi:plus" className="text-black size-5" />
          </SheetTrigger>

            <SheetContent side="bottom" className="h-3/4 max-h-screen justify-center items-center">
              <SheetHeader>
                <SheetTitle className="flex pb-4 justify-center items-center">ค้นหาเมนูอาหาร</SheetTitle>
              </SheetHeader>

              <SearchBox
                onSearch={handleSearch}
                foodData={foodData}
                setFilteredFoodData={setFilteredFoodData} />

              <div className="flex flex-col w-screen justify-start items-center h-full pt-4 pb-24 pr-4">

                <div className="flex flex-col w-full h-full overflow-y-auto gap-4 pb-8">
                  {filteredFoodData.length > 0 ? (
                    filteredFoodData.map((food, index) => (
                      <motion.div
                        key={food.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        className='flex w-full h-full justify-start '
                      >
                        <SearchFoodBox key={food.id} food={food} isEdit={isEdit} setChooseFood={handleChooseFood} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center w-full text-gray-500">
                      <img src="Nofoodsearch.png" width={300} height={300} className=" mt-16" />
                      <div className="text-heading3">ไม่พบเมนูอาหาร</div>
                    </div>
                  )}
                </div>

              </div>


            </SheetContent>

        </Sheet><button
          onClick={() => {
            handleSaveMealPlan_Edit();
            setEditItem([]);
          } }
          className="flex bottom-24 w-10/12 justify-center items-center my-4 bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
        >
            บันทึก
          </button><button
            onClick={() => {
              setIsEdit(false);
              setEditItem([]);
              setMergeItems([...allItems]);
            } }
            className="flex bottom-24 w-10/12 justify-center items-center border border-orange300 text-orange300 py-4 rounded-xl text-body1 font-bold"
          >
            ยกเลิก
          </button>
          </>
      )}


      {!isEdit && eatenItems.length > 0 && (
        isMedicine ? (
          <div className="flex bg-white w-10/12 justify-center items-center rounded-xl drop-shadow-xl mt-6 py-3 text-body2 font-bold">
            {desc}ที่รับประทานแล้ว
          </div>
        ) : (
          <div className="flex bg-white w-10/12 justify-between items-center rounded-xl drop-shadow-xl mt-6 py-3 px-5 text-body2 font-bold">
            <div>{desc}ที่รับประทานแล้ว</div>
            <div className="flex text-body3">
              <div className="font-bold">{totalCalories}</div>
              <div className="font-bold text-grey300"> &nbsp;/ {userData?.calories_limit} แคลอรี่ </div>
            </div>
          </div>
        )
      )}


      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col w-full items-center"
        >
          
          
          
          {!isEdit && eatenItems
            .sort((a, b) => a.meal_time - b.meal_time)
            .map((item, index) => (
            <React.Fragment key={index}>
              {renderItem(item, true)}
            </React.Fragment>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChooseBar;