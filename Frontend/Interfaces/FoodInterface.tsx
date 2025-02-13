export interface FoodInterface {
    id: number
    recipe_name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    sodium: number
    phosphorus: number
    potassium: number
    image_url: string
    recipe_method: []
    ingredient: { 
        ingredient_amount: number
        ingredient_name: string
        ingredient_unit: string
    }[]
}


export interface MealplanInterface {
    mealPlan: {
        mealplans: {
            meals: {
                name: string;
                nutrition: {
                    calories: number;
                    carbs: number;
                    fat: number;
                    phosphorus: number;
                    potassium: number;
                    protein: number;
                    sodium: number;
                };
                recipe_id: string;
            }[];
            total_nutrition: {
                calories: number;
                carbs: number;
                fat: number;
                phosphorus: number;
                potassium: number;
                protein: number;
                sodium: number;
            };
        }[];
    }[];
}