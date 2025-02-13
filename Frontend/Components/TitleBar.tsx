'use client'
import { Icon } from "@iconify/react";
import Link from "next/link";
import TitleBarInterface from "@/Interfaces/TitleBarInterface";

const TitleBar:React.FC<Pick<TitleBarInterface, 'title' | 'href'>> = ({title, href}) => {
    return(
        <>
           <div className="relative flex justify-center items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold ">
                <Link className="absolute left-4" href={href}>
                    <Icon
                        icon="majesticons:arrow-left"
                        height="28"
                    />
                </Link>
                {title}
            </div>
        </>
    )
}

export default TitleBar