'use client'
import { Icon } from "@iconify/react";
import TitleBar from "@/Interfaces/TitleBarInterface";

const TitleBarStatePage:React.FC<Pick<TitleBar, 'title' | 'statePage' | 'setStatePage'>> = ({title, statePage, setStatePage}) => {

    return(
        <>
           <div className="relative flex justify-center items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold ">
                <div className="absolute left-4" onClick={() => setStatePage(statePage - 1)}>
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

export default TitleBarStatePage