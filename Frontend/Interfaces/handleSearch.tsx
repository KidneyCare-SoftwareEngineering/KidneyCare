import { FoodInterface } from '@/Interfaces/Meal_PillInterface';
export default interface handleSearch {
    onSearch: (searchTerm: string) => void;
    foodData: FoodInterface[];
    setFilteredFoodData: React.Dispatch<React.SetStateAction<FoodInterface[]>>;
}


