"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Meal_planInterface } from "@/Interfaces/Meal_PillInterface";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";

const MEAL_TIMES = {
  1: { title: "อาหารเช้า", icon: "vaadin:morning"},
  2: { title: "อาหารกลางวัน", icon: "mdi:food-ramen" },
  3: { title: "อาหารเย็น", icon: "ph:bowl-food-fill" },
  4: { title: "ของว่าง", icon: "mdi:food-apple" }
};

const FoodHistory: React.FC<{mealPlans: Meal_planInterface; userUid: string; isSheetOpen: boolean; setIsSheetOpen: (value: boolean) => void ;}> = ({mealPlans, userUid, setIsSheetOpen, isSheetOpen}) => {
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [organizedMeals, setOrganizedMeals] = useState<any[]>([]);
  

  useEffect(() => {
    if (mealPlans && mealPlans.meal_plans && mealPlans.meal_plans.length > 0) {

      const meals = [
        {
          mealTime: 1,
          title: "อาหารเช้า",
          icon: "vaadin:morning",
          highlight: false,
          items: [] as { name: string; calories: string; recipe_id: number }[],
          calories: "", 
        },
        {
          mealTime: 2,
          title: "อาหารกลางวัน",
          icon: "mdi:food-ramen",
          highlight: false,
          items: [] as { name: string; calories: string; recipe_id: number }[],
          calories: "",
        },
        {
          mealTime: 3,
          title: "อาหารเย็น",
          icon: "ph:bowl-food-fill",
          highlight: false,
          items: [] as { name: string; calories: string; recipe_id: number }[],
          calories: ""
        },
        {
          mealTime: 4,
          title: "ของว่าง",
          icon: "mdi:food-apple",
          highlight: false,
          items: [] as { name: string; calories: string; recipe_id: number }[],
          calories: ""
        },
      ];

      const currentPlan = mealPlans.meal_plans[0];
      if (currentPlan && currentPlan.recipes) {
        currentPlan.recipes.forEach(recipe => {
          if (recipe.ischecked) {
            const mealTimeIndex = meals.findIndex(meal => meal.mealTime === recipe.meal_time);
            
            if (mealTimeIndex !== -1) {
              meals[mealTimeIndex].items.push({
                name: recipe.recipe_name,
                calories: `${recipe.calories} แคลอรี่ ต่อ 1 เสิร์ฟ`,
                recipe_id: recipe.recipe_id
              });
            }
          }
        });
      }

      meals.forEach(meal => {
        if (meal.items.length > 0) {
          const totalCalories = meal.items.reduce((sum, item) => {
            const caloriesValue = parseFloat(item.calories.split(' ')[0]);
            return sum + (isNaN(caloriesValue) ? 0 : caloriesValue);
          }, 0);
          
          meal.calories = `${totalCalories} แคลอรี่`;
        }
      });

      setOrganizedMeals(meals);
    } else{
      setOrganizedMeals([
        {
          mealTime: 1,
          title: "อาหารเช้า",
          icon: "vaadin:morning",
          highlight: false,
          items: [],
          calories: "",
        },
        {
          mealTime: 2,
          title: "อาหารกลางวัน",
          icon: "mdi:food-ramen",
          highlight: false,
          items: [],
          calories: "",
        },
        {
          mealTime: 3,
          title: "อาหารเย็น",
          icon: "ph:bowl-food-fill",
          highlight: false,
          items: [],
          calories: ""
        },
        {
          mealTime: 4,
          title: "ของว่าง",
          icon: "mdi:food-apple",
          highlight: false,
          items: [],
          calories: ""
        },
      ]);
    }
  }, [mealPlans]);

  const toggleItems = (index: number) => {
    setExpandedMeal(expandedMeal === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-full h-full p-4">
      <div className="flex-grow pb-0">
        {organizedMeals.map((meal, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer"
            onClick={() => toggleItems(index)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icon icon={meal.icon} className="text-gray-700 w-6 h-6" />
                <h3 className="font-semibold text-gray-800">{meal.title}</h3>
              </div>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger className="flex items-center size-10 rounded-full justify-center bg-orange75 p-2">
                  <Icon
                    icon="ic:baseline-plus"
                    className="text-orange300 w-5 h-5"
                  />
                </SheetTrigger>
                {/* Popup อยู่ page.tsx */}
              </Sheet>
              
            </div>
            <p
              className={`mt-1 text-sm ${
                meal.highlight ? "text-red-500 font-bold" : "text-gray-600"
              }`}
            >
              {meal.calories !== "" ? (<>{meal.calories}</>) : (<>ไม่มีการบันทึกอาหารที่รับประทาน</>)}
            </p>
            {expandedMeal === index && meal.items.length > 0 && (
              <div className="mt-2 border-t border-gray-200">
                {meal.items.map((item: { name: string; calories: string; recipe_id: number }, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="text-gray-800 font-medium">{item.name}</p>
                      <p className="text-gray-500 text-sm">{item.calories}</p>
                    </div>
                    <Icon
                      icon="mdi:chevron-right"
                      className="text-gray-400 w-5 h-5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      

    </div>

    
  );
};

export default FoodHistory;