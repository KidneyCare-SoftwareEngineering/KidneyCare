export default interface FoodInterface {
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