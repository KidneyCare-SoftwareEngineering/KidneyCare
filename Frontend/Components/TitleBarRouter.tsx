'use client'
import { Icon } from "@iconify/react";
import Link from "next/link";
import TitleBarInterface from "@/Interfaces/TitleBarInterface";
import { useRouter } from "next/navigation";

const TitleBar:React.FC<Pick<TitleBarInterface, 'title'> & { setChooseFood: (value: boolean) => void } & { setIsSheetOpen: (value: boolean) => void } > = ({title, setChooseFood, setIsSheetOpen}) => {
    const router = useRouter()
    return(
        <>
           <div className="relative flex justify-center items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold ">
                <div className="absolute left-4" onClick={() => { setChooseFood(false); setIsSheetOpen(true); }}>
                    <Icon
                        icon="majesticons:arrow-left"
                        height="28"
                    />
                </div>
                {title}
            </div>
        </>
    )
}

export default TitleBar