'use client'
import { Icon } from "@iconify/react";

export default function Navbar() {
    return(
        <>
            <div className="flex justify-around bg-white w-screen h-20 rounded-b-xl drop-shadow-lg">
                <div className="flex flex-col justify-center items-center text-grey300 text-body3 gap-1">
                    <Icon icon="hugeicons:cook-book" height="32"/>
                    วางแผน
                </div>

                <div className="flex flex-col justify-center items-center text-black text-body3 gap-1">
                    <Icon icon="hugeicons:menu-restaurant" height="32" className="text-orange300"/>
                    ค้นหาสารอาหาร
                </div>

                <div className="flex flex-col justify-center items-center text-grey300 text-body3 gap-1">
                    <Icon icon="fluent:pill-24-regular" height="32"/>
                    แจ้งเตือนทานยา
                </div>

                <div className="flex flex-col justify-center items-center text-grey300 text-body3 gap-1">
                    <Icon icon="bi:person" height="32"/>
                    ประวัติการกิน
                </div>
            </div>
        </>
    )
}
