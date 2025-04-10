export interface UserInformation {
    gender: string;
    height: number;
    weight: number;
    age: number;
    birthdate: string;
    kidney_level: number;
    calories_limit: number;
    nutrients_limit:{
        phosphorus: number,
        protein: number,
        fat: number,
        sodium: number,
        carbs: number,
        potassium: number
    }
}
