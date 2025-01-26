'use client';

import { useRouter } from 'next/navigation';
import './styles.css';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="relative flex items-center p-4 border-b bg-white shadow-md">
      {/* ปุ่มกลับ */}
      <button
        className="absolute left-4"
        onClick={() => router.back()} // กลับไปหน้าก่อนหน้า
      >
        <span className="text-gray-600 text-[24px]">←</span>
      </button>
      {/* Title */}
      <h1 className="flex-1 text-center text-[20px] font-bold text-[#1B1B1B] font-sans">{title}</h1>
    </header>
  );
}
