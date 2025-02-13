"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

const meals = [
  {
    title: "อาหารเช้า",
    icon: "vaadin:morning",
    calories: "375 แคลอรี่ / 250 แคลอรี่",
    highlight: true,
    items: [
      { name: "ข้าวกะเพราหมูสับ", calories: "225 แคลอรี่ ต่อ 1 เสิร์ฟ" },
      { name: "ไข่ตุ๋นหมอสด", calories: "150 แคลอรี่ ต่อ 1 เสิร์ฟ" },
    ],
  },
  {
    title: "อาหารกลางวัน",
    icon: "mdi:food-ramen",
    calories: "210 แคลอรี่ / 910 แคลอรี่",
    highlight: false,
    items: [{ name: "ข้าวผัดไก่ใส่ไข่", calories: "210 แคลอรี่ ต่อ 1 เสิร์ฟ" }],
  },
  {
    title: "อาหารเย็น",
    icon: "ph:bowl-food-fill",
    calories: "แนะนำที่ 550 กิโลแคลอรี่",
    highlight: false,
    items: [],
  },
  {
    title: "ของว่าง",
    icon: "mdi:food-apple",
    calories: "แนะนำที่ 220 กิโลแคลอรี่",
    highlight: false,
    items: [],
  },
];

const FoodHistory: React.FC = () => {
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<{
    name: string;
    calories: string;
  } | null>(null);

  const toggleItems = (index: number) => {
    if (expandedMeal === index) {
      setExpandedMeal(null);
    } else {
      setExpandedMeal(index);
    }
  };

  const addMealItem = (mealIndex: number) => {
    if (newItem && mealIndex !== null) {
      meals[mealIndex].items.push(newItem);
      setNewItem(null);
    }
  };

  return (
    <div className="flex flex-col min-h-full h-full p-4">
      <div className="flex-grow pb-0">
        {meals.map((meal, index) => (
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMealItem(index);
                }}
                className="p-2"
              >
                <Icon
                  icon="uiw:plus-circle"
                  className="w-8 h-8 text-orange-200"
                />
              </button>
            </div>
            <p
              className={`mt-1 text-sm ${
                meal.highlight ? "text-red-500 font-bold" : "text-gray-600"
              }`}
            >
              {meal.calories}
            </p>
            {expandedMeal === index && meal.items.length > 0 && (
              <div className="mt-2 border-t border-gray-200">
                {meal.items.map((item, idx) => (
                  <div
                    key={idx}
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
