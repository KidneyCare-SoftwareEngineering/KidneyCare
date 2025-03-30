export interface Register1Interface {
  setSelectCondition: React.Dispatch<React.SetStateAction<number[]>>;
  selectCondition: number[];
  statePage: number;
  setStatePage: React.Dispatch<React.SetStateAction<number>>;
}

export interface Register2Interface {
  name: string;
  birthdate: string;
  weight: number;
  height: number;
  gender: string;
  kidneyLevel: number;
  dialysis: boolean;
  selectCondition: number[];
  statePage: number;
  setSelectCondition: React.Dispatch<React.SetStateAction<number[]>>;
  setStatePage: React.Dispatch<React.SetStateAction<number>>;
  userUid: string;
  userProfile: string | null;
}