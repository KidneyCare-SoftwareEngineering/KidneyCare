import Image from "next/image";
import { useEffect } from "react";

const liffId = process.env.NEXT_PUBLIC_LIFF_ID
 
export default function Home() {

  useEffect(async () => {
    const liff = (await import('@line/liff')).default
    try {
      await liff.init({ liffId });
    } catch (error) {
      console.error('liff init error', error.message)
    }
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  })

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        
      </main>
    
    </div>
  );
}
