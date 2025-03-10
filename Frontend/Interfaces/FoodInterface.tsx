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
        image_url: string;
    }>>;
    user_line_id: string;

    medicines?: Array<{
        user_medicine_id: number;
        medicine_schedule: string[];
        medicine_amount: number;
        medicine_per_times: number;
        user_medicine_img_link: string[];
        medicine_unit: string;
        medicine_name: string;
        medicine_note: string;
    }>
}

// export interface MedicineData extends MealplanInterface {
//     user_medicine_id: number;
//     medicine_schedule: string[];
//     medicine_amount: number;
//     medicine_per_times: number;
//     user_medicine_img_link: string[];
//     medicine_unit: string;
//     medicine_name: string;
//     medicine_note: string;

//   }
