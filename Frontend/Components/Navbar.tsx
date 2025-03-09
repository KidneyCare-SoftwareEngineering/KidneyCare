'use client'
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const currentPath = usePathname();

    return (
        <div className="flex justify-around bg-white w-screen h-20 rounded-b-xl drop-shadow-lg">
            <Link href="/mealplan" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/mealplan' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="hugeicons:cook-book" height="32" />
                วางแผน
            </Link>

            <Link href="/searchfood" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/searchfood' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="hugeicons:menu-restaurant" height="32" />
                ค้นหาสารอาหาร
            </Link>

            <Link href="/pillreminder" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/pillreminder' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="fluent:pill-24-regular" height="32" />
                แจ้งเตือนทานยา
            </Link>

            <Link href="/history" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/history' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="bi:person" height="32" />
                ประวัติการกิน
            </Link>
        </div>
    );
}