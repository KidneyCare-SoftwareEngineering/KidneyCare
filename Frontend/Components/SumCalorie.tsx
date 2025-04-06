import CalendarSide from "./CalendarSide";
import { Chart, ArcElement } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import React, { useEffect, useState } from "react";
import { Meal_planInterface } from "@/Interfaces/Meal_PillInterface";
import { da } from "date-fns/locale";
import { set } from "date-fns";

Chart.register(ArcElement);

const SumCalorie: React.FC<{userUid: string}> = (userUid) => {

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealPlans, setMealPlans] = useState<Meal_planInterface>();
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const remainingCalories = 500 - totalCalories;
  
  const datatoback = {
    user_line_id: userUid.userUid,
    date: selectedDate.toISOString().split("T")[0]  
  }


  useEffect(() => {
    const get_meal_plan = async () => {
      // setIsLoading(true)
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/get_meal_plan`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(datatoback),
              });
              const data = await response.json();
              setMealPlans(data);
              console.log("mealPlans", data);
      } catch (error) {
          console.log("error", error)
      } finally{
          // setIsLoading(false)

      }
      
    }; 
    get_meal_plan()
  }, [userUid, selectedDate]);

  useEffect(() => {
      if (!mealPlans) return;

      const total = mealPlans.meal_plans
        .flatMap((mealPlan) => mealPlan.recipes)
        .filter((recipe) => recipe.ischecked)
        .reduce((sum, recipe) => sum + recipe.calories, 0);

        setTotalCalories(total);
    }, [mealPlans]);

  
  

  const data = {
    datasets: [
      {
        data: [remainingCalories, totalCalories],
        backgroundColor: ["#FF7E2E", "#FAF5EF"],
      },
    ],
  };

  const options = {
    cutout: "80%",
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="flex flex-col items-center w-full px-4 drop-shadow-lg rounded-lg relative">
      {/* ปฏิทิน */}
      <div className="w-full max-w-3xl mt-4 p-4 bg-white rounded-lg shadow-md">
        <div className="w-full mb-4">
          <CalendarSide onDateSelect={setSelectedDate} />
        </div>

        {/* แคลอรี่ข้อมูล */}
        <div className="flex flex-col w-full max-w-3xl mt-4 p-4">
          <div className="flex flex-row w-full items-center">
            {/* คอลัมน์ฝั่งซ้าย */}
            <div
              className="flex flex-col items-center"
              style={{ width: "140px" }}
            >
              <p className="text-lg">แคลอรี่ที่ได้รับ</p>
              <p className="text-3xl font-bold">{totalCalories}</p>
              <p className="text-lg">แคลอรี่</p>
            </div>

            {/* คอลัมน์ฝั่งขวา */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative w-40 h-40">
                <Doughnut data={data} options={options} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-4xl font-extrabold">{remainingCalories}</p>
                  <p className="text-sm">แคลอรี่ที่เหลือ</p>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูล */}
          <div className="flex flex-row justify-between mt-8">
            <div className="flex flex-col text-left font-bold">
              <p>โปรตีน</p>
              <p>คาร์โบไฮเดรต</p>
              <p>ไขมัน</p>
              <p>เกลือแร่</p>
            </div>
            <div className="flex flex-col text-right">
              <p>35 / 75 กรัม</p>
              <p>150 / 350 กรัม</p>
              <p>25 / 44 กรัม</p>
              <p>6 / 10 มิลกรัม</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SumCalorie;
