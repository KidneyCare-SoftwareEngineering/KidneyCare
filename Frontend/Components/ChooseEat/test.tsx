// import React, {useEffect, useState} from "react";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { Meal_planInterface, MedicineData } from "@/Interfaces/Meal_PillInterface";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/Components/ui/sheet";
// import SearchFoodBox from "@/Components/SearchFoodBox";
// import { FoodInterface, recipesInterface} from "@/Interfaces/Meal_PillInterface";
// import PuffLoader from "react-spinners/PuffLoader";
// import SearchBox from "@/Components/SearchBox";
// import ChooseFood from "./ChooseFood_Edit/page";



// const ChooseBar: React.FC<{MealPlans: Meal_planInterface, desc: string, isEdit: boolean, setIsEdit:React.Dispatch<React.SetStateAction<boolean>>;}> = ({MealPlans, desc, isEdit, setIsEdit}) =>  {
//   const [eatenItems, setEatenItems] = useState<any[]>([]);
//   const [foodData, setFoodData] = useState<FoodInterface[]>([]);
//   const [isSheetOpen, setIsSheetOpen] = useState(false);
//   const [filteredFoodData, setFilteredFoodData] = useState<FoodInterface[]>([]);
//   const transition = { type: "spring", stiffness: 200, damping: 20 };
//   const [chooseFood, setChooseFood] = useState<boolean>(false);
//   const [foodChoosed, setFoodChoosed] = useState<number>();
//   const [foodChoosedData, setFoodChoosedData] = useState<FoodInterface[]>([]);
  
//   useEffect(() => {
//     console.log("foodChoosedData", foodChoosedData);
//     console.log("sheetOpen", isSheetOpen);
//   },[isSheetOpen])
  
//   const containerVariants = {
//     visible: { transition: { staggerChildren: 0.1 } },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20, scale: 0.95 },
//     visible: { opacity: 1, y: 0, scale: 1, transition },
//     exit: { opacity: 0, y: -20, scale: 0.95, transition }, 
//   };

//   const allItems = desc === "ยา" ? MealPlans.medicines || [] : MealPlans.meal_plans[0].recipes || [];
//   const already_item = desc === "ยา" ? MealPlans.medicines || [] : (MealPlans.meal_plans[0].recipes || []).filter(recipe => recipe.ischecked);
//   const notyet_item = desc === "ยา" ? MealPlans.medicines || [] : (MealPlans.meal_plans[0].recipes || []).filter(recipe => !recipe.ischecked);
//   const mealTypes = ["อาหารเช้า", "อาหารกลางวัน", "อาหารเย็น"];

//   const handleSearch = (searchTerm: string) => {
//     if (foodData) {
//       if (searchTerm.trim() === '') {
//         setFilteredFoodData(foodData);
//       } else {
//         const filtered = foodData.filter(food =>
//           food.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//         setFilteredFoodData(filtered);
//       }
//     }
//   };

//   const handleSelectFood = async (food: recipesInterface) => {
//       setEatenItems((prev) => [...prev, food]); 
//       try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/user_already_eat`, {
//               method: "PATCH",
//               headers: {
//                   "Content-Type": "application/json",
//               },
//               body: JSON.stringify({ 
//                   meal_plan_recipe_id: food.meal_plan_recipe_id,
//                   ischecked: true, 
//               }),
//           });
//           const data = await response.json();
//       }
//       catch (error) {
//           console.log("error", error);
//       }
//   };

//   const handleDeselectFood = async (food: recipesInterface) => {
//     setEatenItems((prev) => prev.filter((item) => item !== food)); 
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/user_already_eat`, {
//           method: "PATCH",
//           headers: {
//               "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ 
//               meal_plan_recipe_id: food.meal_plan_recipe_id,
//               ischecked: false, 
//           }),
//       });
//       const data = await response.json();
//   }
//   catch (error) {
//       console.log("error", error);
//   }
//   };


//   useEffect(() => {
//       fetch(`${process.env.NEXT_PUBLIC_API_URL}/food_cards`)
//         .then(response => response.json())
//         .then(data => {
//           setFoodData(data)
//           setFilteredFoodData(data);
//         })
//         .catch(error => {
//           console.error('Error fetching user data:', error)
//         })
//     }, [])

//   const handleChooseFood = (id: number) => {
//     setFoodChoosed(id)
//     setChooseFood(true)
//     setIsSheetOpen(false)
//   }

//   useEffect(() => {
//     console.log("AllItems", allItems);
//   })

//   return (
    
//     <div className='flex w-full h-full flex-col items-center mt-3 relative'>
//       <div className="flex bg-white w-10/12 justify-center items-center rounded-xl drop-shadow-xl mt-6 py-3 text-body2 font-bold">
//         {desc}ที่ต้องรับประทาน
//       </div>
      
//       {chooseFood && foodChoosed !== null && (
//         <div className="fixed w-screen h-screen inset-0 bg-white z-[10000]">
//           <ChooseFood id={foodChoosed} setChooseFood={setChooseFood} setFoodChoosedData={setFoodChoosedData} setIsSheetOpen={setIsSheetOpen}/>
//         </div>
//       )}

      


//       <AnimatePresence mode="popLayout">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           className="flex flex-col w-full items-center"
//         >
//           {allItems
//             .filter((data) => !already_item.includes(data)) 
//             .map((data, index) => {
//             if (desc === "ยา") {
//               return(
//                 <motion.div
//                       layout
//                       variants={itemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                       className="flex w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3"
//                       key={index}>

//                   {/* // เปลี่ยน href ลิงก์ไปยังหน้า detail ยา ด้วยนะ */}
//                   <Link href={`/pillreminder/pilldetail/${data.user_medicine_id}`} className="flex w-4/12 justify-center items-center">
//                     <img src="https://picsum.photos/200/300" className="size-24 rounded-full p-2"/>
//                   </Link>
//                   <div className="flex w-6/12 p-2 justify-center flex-col">
//                     <div className="flex text-body3 text-grey300">
//                       เวลา {data.medicine_schedule[0].split("T")[1].slice(0, 5)} น.
//                     </div> 
//                     <Link href={`/pillreminder/pilldetail/${data.user_medicine_id}`}
//                           className="flex text-body1 font-bold text-black py-3">
//                       {data.medicine_name} 
//                     </Link> 
//                     <div className="flex text-body3 text-black">
//                       จำนวน {data.medicine_per_times} {data.medicine_unit}
//                     </div> 
//                   </div>
//                   <div  onClick={() => handleSelectFood(data)}
//                         className="flex w-2/12 justify-center items-center">
//                     <div className="flex size-6 rounded-full border-2 border-orange300"></div>
//                   </div>
//                 </motion.div> 
//               )
//             } 
//           else { 
//             if (isEdit) { 
//               return (
//                 <motion.div
//                   layout
//                   variants={itemVariants}
//                   initial="hidden"
//                   animate="visible"
//                   exit="exit" 
//                   className="flex w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3"
//                   key={index}>
//                   <Link href={`/fooddetail/${data.recipe_id}`} className="flex w-4/12 justify-center items-center">
//                     <img src={`${data.recipe_img_link}`} alt="food" className="size-24 rounded-full p-2 object-cover"/>
//                   </Link>
//                   <div className="flex w-6/12 p-2 justify-center flex-col">
//                     <div className="flex text-body3 text-grey300">
//                       {mealTypes[allItems.indexOf(data)]}
//                     </div> 
//                     <Link href={`/fooddetail/${data.recipe_id}`}
//                           className="flex text-body1 font-bold text-black py-3 line-clamp-1">
//                       {data.recipe_name} 
//                     </Link> 
//                     <div className="flex text-body3 text-black">
//                       {data.calories} <p className="text-grey300"> &nbsp;กิโลแคลอรี่</p> 
//                     </div> 
//                   </div>
//                   <div  onClick={() => handleSelectFood(data)}
//                         className="flex w-2/12 justify-center items-center">
//                     <Icon icon="mdi:trash" className="text-black size-5"/>
//                   </div>
//               </motion.div>
//               )
//             } else {
//               return (
//                 <motion.div
//                   layout
//                   variants={itemVariants}
//                   initial="hidden"
//                   animate="visible"
//                   exit="exit" 
//                   className="flex w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3"
//                   key={index}>
//                   <Link href={`/fooddetail/${data.recipe_id}`} className="flex w-4/12 justify-center items-center">
//                     <img src={`${data.recipe_img_link}`} alt="food" className="size-24 rounded-full p-2 "/>
//                   </Link>
//                   <div className="flex w-6/12 p-2 justify-center flex-col">
//                     <div className="flex text-body3 text-grey300">
//                       {mealTypes[allItems.indexOf(data)]}
//                     </div> 
//                     <Link href={`/fooddetail/${data.recipe_id}`}
//                           className="flex text-body1 font-bold text-black py-3 line-clamp-1">
//                       {data.recipe_name} 
//                     </Link> 
//                     <div className="flex text-body3 text-black">
//                       {data.calories} <p className="text-grey300"> &nbsp;กิโลแคลอรี่</p> 
//                     </div> 
//                   </div>
//                   <div  onClick={() => handleSelectFood(data)}
//                         className="flex w-2/12 justify-center items-center">
//                     <div className="flex size-6 rounded-full border-2 border-orange300"></div>
//                   </div>
//               </motion.div>
//               )
//             }   
//           }
//         })}           
            
//         </motion.div>
//         </AnimatePresence>
//         {already_item.length > 0 && (    
//           desc === "ยา" ? 
//             <div className="flex bg-white w-10/12 justify-center items-center rounded-xl drop-shadow-xl mt-6 py-3 text-body2 font-bold">
//               {desc}ที่รับประทานแล้ว
//             </div>
//           : 
//             <div className="flex bg-white w-10/12 justify-between items-center rounded-xl drop-shadow-xl mt-6 py-3 px-5 text-body2 font-bold">
//               <div>{desc}ที่รับประทานแล้ว</div>
//               <div className="flex text-body3">
//                 <div className="font-bold"> {eatenItems.reduce((sum, food) => sum + food.calories, 0)} </div>
//                 <div className="font-bold text-grey300"> &nbsp;/ 2785 แคลอรี่ </div>
//               </div>
//             </div>
//         )}






//         {isEdit && (

//           // popup
//           <>
//             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//               <SheetTrigger className="flex justify-center items-center w-10/12 bg-white min-h-24 drop-shadow-md rounded-xl mt-3 z-0">
//                 <Icon icon="mdi:plus" className="text-black size-5"/>
//               </SheetTrigger>
//               <SheetContent side="bottom" className="flex w-full h-10/12 flex-col overflow-y-auto max-h-[70vh] ">
//                 <SheetHeader>
//                   <SheetTitle>ค้นหาเมนูอาหาร</SheetTitle>
//                 </SheetHeader>

//                 {/* popupshow */}
//                 <div className="flex flex-col w-full ">
//                   <SearchBox 
//                     onSearch={handleSearch}
//                     foodData={foodData}
//                     setFilteredFoodData={setFilteredFoodData} 
//                   />
//                   {filteredFoodData.length > 0 ? (
//                     filteredFoodData.map((food, index) => (
//                       <motion.div 
//                         key={food.id} 
//                         variants={itemVariants} 
//                         initial="hidden" 
//                         animate="visible" 
//                         custom={index}
//                         className='flex w-full h-full justify-center my-1'
//                       >
//                         <SearchFoodBox key={food.id} food={food} isEdit={isEdit} setChooseFood={handleChooseFood}/>
//                       </motion.div>
//                     ))
//                   ) : (
//                     <div className="text-center text-gray-500 mt-8">
//                       <PuffLoader />
//                     </div>
//                   )}

//                 </div>
//               </SheetContent>
//             </Sheet>
            
//             <button
//                 // onClick={() => handleCreateNewMealplans()} ส่งข้อมูลไป API Edit
//                 className="flex bottom-24 w-10/12 justify-center items-center my-4 bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
//             >
//             บันทึก
//             </button>

//             <button
//                 onClick={() => setIsEdit(false)}
//                 className="flex bottom-24 w-10/12 justify-center items-center border border-orange300 text-orange300 py-4 rounded-xl text-body1 font-bold"
//             >
//             ยกเลิก
//             </button>
//           </>
//         )}
//         <AnimatePresence>
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             className="flex flex-col w-full items-center"
//           >
//             {already_item
//               .map((data, index) => desc === "ยา" ? 
//               (
//                 <motion.div
//                       layout
//                       variants={itemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                       className="flex w-10/12 bg-grey200 border border-grey300 min-h-24 drop-shadow-md rounded-xl mt-3"
//                       key={index}>

//                   {/* // เปลี่ยน href ลิงก์ไปยังหน้า detail ยา ด้วยนะ */}
//                   <Link href={`/pillreminder/pildetail/${data.user_medicine_id}`} className="flex w-4/12 justify-center items-center"> 
//                     <img src="https://picsum.photos/200/300" className="size-24 rounded-full p-2"/>
//                   </Link>
//                   <div className="flex w-6/12 p-2 justify-center flex-col">
//                     <div className="flex text-body3 text-grey300">
//                       เวลา {data.medicine_schedule[0].split("T")[1].slice(0, 5)} น.
//                     </div> 
//                     <Link href={`/pillreminder/pildetail/${data.user_medicine_id}`}
//                           className="flex text-body1 font-bold text-black py-3">
//                       {data.medicine_name} 
//                     </Link> 
//                     <div className="flex text-body3 text-black">
//                       จำนวน {data.medicine_per_times} {data.medicine_unit}
//                     </div> 
//                   </div>
//                   <div  onClick={() => handleDeselectFood(data)} 
//                         className="flex w-2/12 justify-center items-center">
//                     <div className="flex size-6 rounded-full bg-grey500 justify-center items-center">
//                       <Icon icon="material-symbols:check-rounded" className="text-white size-5"/>
//                     </div>
//                   </div>
//                 </motion.div> 

//               ) : (
//                 <motion.div
//                       layout
//                       variants={itemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                       className="flex w-10/12 bg-grey200 border border-grey300 min-h-24 drop-shadow-md rounded-xl mt-3"
//                       key={index}>                        
//                     <div className="flex w-4/12 justify-center items-center">
//                       <img src={`${data.recipe_img_link}`} alt="food" className="size-24 rounded-full p-2"/>
//                     </div>
//                     <div className="flex w-6/12 p-2 justify-center flex-col">
//                       <div className="flex text-body3 text-grey300">
//                         {mealTypes[allItems.indexOf(data)]}
//                       </div> 
//                       <div className="flex text-body1 font-bold text-black py-3">
//                         {data.recipe_name} 
//                       </div> 
//                       <div className="flex text-body3 text-black">
//                         {data.calories} <p className="text-grey300"> &nbsp;กิโลแคลอรี่</p> 
//                       </div> 
//                     </div>
//                     <div  onClick={() => handleDeselectFood(data)} 
//                           className="flex w-2/12 justify-center items-center">
//                       <div className="flex size-6 rounded-full bg-grey500 justify-center items-center">
//                         <Icon icon="material-symbols:check-rounded" className="text-white size-5"/>
//                       </div>
//                     </div>
//                 </motion.div>
//               )
//             )}
//           </motion.div>
//         </AnimatePresence>

      
//     </div>

//   );
// };

// export default ChooseBar;