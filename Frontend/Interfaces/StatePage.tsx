import { MealplanInterface } from "./Meal_PillInterface";

export interface BaseStatePageMealplans {
    setStatePage: React.Dispatch<React.SetStateAction<number>>;
    statePage: number;
    mealPlan: MealplanInterface;
  }
  
export interface StatePage1Props extends BaseStatePageMealplans {
    setDayIndex: React.Dispatch<React.SetStateAction<number>>;
}
  
export interface StatePage2Props extends BaseStatePageMealplans {
    setMealPlan: React.Dispatch<React.SetStateAction<MealplanInterface>>;
    dayIndex: number;
    selectedValue?: number;
}