'use client'
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const currentPath = usePathname();

    return (
        <div className="flex justify-around bg-white w-screen h-20 rounded-b-xl drop-shadow-lg">
            <Link href="/MealPlan" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/MealPlan' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="hugeicons:cook-book" height="32"/>
                วางแผน
            </Link>

            <Link href="/SearchFood" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/SearchFood' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="hugeicons:menu-restaurant" height="32"/>
                ค้นหาสารอาหาร
            </Link>

            <Link href="/PillReminder" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/PillReminder' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="fluent:pill-24-regular" height="32"/>
                แจ้งเตือนทานยา
            </Link>

            <Link href="/History" className={`flex flex-col justify-center items-center text-body3 gap-1 ${currentPath === '/EatingHistory' ? 'text-orange300' : 'text-grey300'}`}>
                <Icon icon="bi:person" height="32"/>
                ประวัติการกิน
            </Link>
        </div>
    );
}