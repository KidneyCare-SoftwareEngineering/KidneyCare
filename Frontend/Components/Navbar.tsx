'use client'
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    
    return(
        <>
            <div className={`flex justify-around bg-white w-screen h-20 rounded-b-xl drop-shadow-lg`}>
                <Link   href={`/mealplan`} 
                        className={`flex flex-col justify-center items-center text-body3 gap-1  ${
                    pathname === "/mealplan" ? "text-black" : "text-grey300" }`}
                >
                    <Icon icon="hugeicons:cook-book" height="32" className={` ${pathname === "/mealplan" ? "text-orange300" : "text-grey300"}`}/>
                    วางแผน
                </Link>

                <Link href={`/searchfood`} className={`flex flex-col justify-center items-center text-body3 gap-1 ${
                    pathname === "/searchfood" ? "text-black" : "text-grey300" }`}>
                    <Icon icon="hugeicons:menu-restaurant" height="32" className={` ${pathname === "/searchfood" ? "text-orange300" : "text-grey300"}`}/>
                    ค้นหาสารอาหาร
                </Link>

                <Link href={`/pillreminder`} className={`flex flex-col justify-center items-center text-body3 gap-1 ${
                    pathname === "/pillreminder" ? "text-black" : "text-grey300" }`}>
                    <Icon icon="fluent:pill-24-regular" height="32" className={` ${pathname === "/pillreminder" ? "text-orange300" : "text-grey300"}`}/>
                    แจ้งเตือนทานยา
                </Link>

                <Link href={`/profile/history`} className="flex flex-col justify-center items-center text-grey300 text-body3 gap-1">
                    <Icon icon="bi:person" height="32" className={` ${pathname === "/profile/history" ? "text-orange300" : "text-grey300"}`}/>
                    ประวัติการกิน
                </Link>
            </div>
        </>
    )
}
