import React, {useState, useEffect} from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import TitleBarStatePage from '@/Components/TitleBarStatePage'
import { StatePage1Props } from '@/Interfaces/StatePage'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'


const StatePage1 : React.FC<StatePage1Props> = ({setStatePage, statePage, mealPlan, setDayIndex, selectedValue, userUid}) => {
    
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter()

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (index: number) => ({
          opacity: 1,
          y: 0,
          transition: { 
            duration: 0.5, 
            delay: index * 0.2  
          },
        }),
      };

      const handleCreateNewMealplans = async () => {
        setLoading(true)
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_DIESEL_URL}/create_meal_plan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mealPlan),
          });
          if (!response.ok) {
            throw new Error('Network response no ok');
          }
        } catch (error) {
            console.error('Error:', error);
            console.log("mealplan", mealPlan)
        } finally {
            setLoading(false)
            console.log("mealplan", mealPlan)
            // router.push('/mealplan');
        }
      }
    if (loading) 
        return (
            <div className="flex w-screen h-screen flex-col justify-center items-center bg-sec"> 
                <p className="mt-4 text-lg font-bold text-orange300 animate-pulse">กำลังสร้างแผนมื้ออาหาร</p>
            </div>
        )
    return (
    <>
        <div className="flex w-full h-full flex-col items-center pb-10  bg-sec">
            <TitleBarStatePage title="รายการอาหารของคุณ" statePage={statePage} setStatePage={setStatePage}/>
            <img
                src="/Untitled-3.jpg"
                className="flex w-full"
              />
            
            <div className="flex w-full px-6 pt-6 text-heading4 font-bold">แผนอาหารทั้งหมด {selectedValue} วัน</div>
            <div className="flex w-full px-6 pt-2 text-body2 text-grey300">สามารถดูและปรับแต่งเมนูในแต่ละวันได้</div>
            {mealPlan?.mealplans.map((data,index) => (
                <motion.div 
                    variants={itemVariants} 
                    initial="hidden" 
                    animate="visible" 
                    custom={index}
                    key={index} 
                    onClick={() => {
                      setStatePage(2)
                      setDayIndex(index)
                    }}
                    className="flex w-11/12 h-14 rounded-xl drop-shadow-xl bg-white mt-6 px-4"> 
                    <div className="flex w-11/12 justify-start items-center text-body1 font-bold min-h-12"> 
                        วันที่ {index+1}
                    </div>
                    <div className="flex w-1/12 justify-center items-center">
                        <Icon icon="weui:arrow-filled" height="24px"/>
                    </div>
                </motion.div>
            ))}
            
            {/* loading component */}
            <div className="flex w-11/12 h-14 rounded-xl drop-shadow-xl bg-white mt-6 px-4 "> 
                <div className="flex w-11/12 animate-pulse justify-start items-center text-body1 font-bold"> 
                    
                <div className="flex bg-slate-300 rounded-full size-8 mr-4"/>
                    <div className="flex bg-slate-300 rounded-full w-8/12 h-2">
                    </div>
                </div>
                <div className="flex w-1/12 animate-pulse justify-center items-center">
                    <Icon icon="weui:arrow-filled" height="24px"/>
                </div>
            </div>

            <button
                onClick={() => handleCreateNewMealplans()}
                className="flex bottom-24 w-10/12 justify-center items-center my-4 bg-orange300 text-white py-4 rounded-xl text-body1 font-bold"
            >
            บันทึก
            </button>

            <Link
                href="/mealplan"
                className="flex bottom-24 w-10/12 justify-center items-center border border-orange300 text-orange300 py-4 rounded-xl text-body1 font-bold"
            >
            ยกเลิก
            </Link>
        </div>
    </>
  )
}

export default StatePage1