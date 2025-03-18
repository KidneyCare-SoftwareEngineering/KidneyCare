import { FoodInterface } from '@/Interfaces/FoodInterface';
export default interface handleSearch {
    onSearch: (searchTerm: string) => void;
    foodData: FoodInterface[];
    setFilteredFoodData: React.Dispatch<React.SetStateAction<FoodInterface[]>>;
}


