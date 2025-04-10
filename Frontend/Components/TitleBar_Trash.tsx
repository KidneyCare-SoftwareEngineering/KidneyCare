'use client'
import { Icon } from "@iconify/react";
import Link from "next/link";
import TitleBarInterface from "@/Interfaces/TitleBarInterface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const TitleBar: React.FC<{title: string; href: string; id: number;}> = ({title, href, id}) => {
    const router = useRouter()
    const handleDelete = async () => {

        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณต้องการลบยานี้หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/delete_medicine?user_medicine_id=${id}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    Swal.fire('สำเร็จ!', 'ลบยานี้เรียบร้อยแล้ว.', 'success');
                } else {
                    Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบยาได้.', 'error');
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบยาได้.', 'error');
            } finally{
                router.push("/PillReminder")
            }
        }
    }

    return (
        <>
            <div className="relative flex justify-between items-center bg-white w-screen h-20 rounded-b-xl drop-shadow-lg text-heading4 font-extrabold  ">
                <Link className="absolute left-4" href={href}>
                    <Icon
                        icon="majesticons:arrow-left"
                        height="28"
                    />
                </Link>
                <div className="flex-grow text-center">
                    {title}
                </div>
                <button onClick={handleDelete} className="absolute right-4">
                    <Icon
                        icon="line-md:trash"
                        height="28"
                    />
                </button>
            </div>
        </>
    )
}

export default TitleBar;