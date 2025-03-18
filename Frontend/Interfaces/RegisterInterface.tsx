export interface RegisterInterface {
    statePage: React.Dispatch<React.SetStateAction<number>>;
    setStatePage: React.Dispatch<React.SetStateAction<number>>;
    setConditions: React.Dispatch<React.SetStateAction<number[]>>;
    setAllergies: React.Dispatch<React.SetStateAction<number[]>>;
    conditions: number[];
    allergies: number[];
    name: string;
    birthdate: string;
    weight: number;
    height: number;
    gender: string;
    kidneyLevel: number;
    dialysis: boolean;
  }