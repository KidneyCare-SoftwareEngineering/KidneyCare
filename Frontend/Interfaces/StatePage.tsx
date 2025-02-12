export default interface statePage {
    setStatePage: React.Dispatch<React.SetStateAction<number>>;
    statePage: number;
    // mealPlan: {
    //     mealplans: {
    //         meals: {
    //             name: string;
    //             nutrition: {
    //                 calories: number;
    //                 carbs: number;
    //                 fat: number;
    //                 phosphorus: number;
    //                 potassium: number;
    //                 protein: number;
    //                 sodium: number;
    //             };
    //             recipe_id: string;
    //         }[];
    //         total_nutrition: {
    //             calories: number;
    //             carbs: number;
    //             fat: number;
    //             phosphorus: number;
    //             potassium: number;
    //             protein: number;
    //             sodium: number;
    //         };
    //     }[];
    // }[];
}