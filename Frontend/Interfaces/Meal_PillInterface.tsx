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
    ingredients_eng: {}
}

export interface MealplanInterface {
    mealplans: Array<Array<{
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
        recipe_img_link: string;
    }>>;
    userUid: string;
    medicines?: Array<any>
}

export interface Meal_planInterface {
    meal_plans: Array<Array<{
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
        recipe_img_link: string;
    }>>;
    userUid: string;
    medicines?: Array<any>
}

interface Medicine {
    user_medicine_id: number;
    medicine_schedule: string[]; 
    medicine_amount: number;
    medicine_per_times: number;
    user_medicine_img_link: string[];
    medicine_unit: string;
    medicine_name: string;
    medicine_note: string;
  }
  
export interface MedicineData extends MealplanInterface{
    medicines: Medicine[];
}
