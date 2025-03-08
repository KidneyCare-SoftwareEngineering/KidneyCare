import { Doughnut } from "react-chartjs-2";
import {Chart ,ArcElement, Legend} from "chart.js";
import {FoodInterface} from "@/Interfaces/FoodInterface";

Chart.register(ArcElement);


const DonutGraph: React.FC<{food: FoodInterface}> = ( { food } ) =>  {

    const data = {
        labels: ["โปรตีน", "คาร์โบไฮเดรต", "วิตามิน", "ไขมัน", "โซเดียม", "ฟอสฟอรัส", "โพแทสเซียม", "น้ำ"],
        datasets: [
            {
                data: [60, 50, 40, 70, 45, 89, 90, 100], 
                backgroundColor: [
                "#79A3FF", 
                "#26DFBC", 
                "#FF8568", 
                "#FFB700", 
                "#BD7DFF", 
                "#BD7DFF", 
                "#BD7DFF",
                "#17C6ED"
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {cutout: "75%"};


  return (
    <>
        <p className="flex justify-center items-center text-heading3 font-bold p-4 ">
            ข้อมูลสารอาหาร
        </p>

        <div className="flex w-full h-fit bg-white mt-2 px-3 justify-center items-center">
            <div className="flex relative w-40 h-40">
                <Doughnut data={data} options={options} />
                <div className="absolute top-1/2 left-1/2  transform -translate-x-1/2 -translate-y-1/2 text-center animate-fadeIn ">
                    <p className="m-0 text-body1 font-bold">{food.calories}</p>
                    <p className="m-0 text-body1">แคลอรี่</p>
                </div>
            </div>
            
            <div className="w-full max-w-2xl mx-auto p-4 space-y-2 bg-white rounded-lg">

            {/* โปรตีน */}
            <div className="flex w-full py-2 px-3 items-center rounded-lg transition-colors">
                <div className="flex flex-1 items-center">
                    <div className="flex w-4 h-4 bg-[#79A3FF] rounded-sm mr-4"/>
                    <span className="text-black text-body2">โปรตีน</span>
                </div>
                <div className="text-black text-body2 sm:text-base">{food?.protein || 0} ก.</div>
            </div>

            {/* คาร์โบไฮเดรต */}
            <div className="flex w-full py-2 px-3 items-center rounded-lg transition-colors">
                <div className="flex flex-1 items-center">
                    <div className="flex w-4 h-4 bg-[#26DFBC] rounded-sm mr-4"/>
                    <span className="text-black text-body2">คาร์โบไฮเดรต</span>
                </div>
                <div className="text-black text-body2">{food?.carbs || 0} ก.</div>
            </div>

            {/* ไขมัน */}
            <div className="flex w-full py-2 px-3 items-center rounded-lg transition-colors">
                <div className="flex flex-1 items-center">
                    <div className="flex w-4 h-4 bg-[#FFB700] rounded-sm mr-4"/>
                    <span className="text-black text-body2">ไขมัน</span>
                </div>
                <div className="text-black text-body2">{food?.fat || 0} ก.</div>
            </div>

            {/* โซเดียม */}
            <div className="flex w-full py-2 px-3 items-center rounded-lg transition-colors">
                <div className="flex flex-1 items-center">
                    <div className="flex w-4 h-4 bg-[#BD7DFF] rounded-sm mr-4"/>
                    <span className="text-black text-body2">โซเดียม</span>
                </div>
                <div className="text-black text-body2">{food?.sodium || 0} ก.</div>
            </div>

            {/* ฟอสฟอรัส */}
            <div className="flex w-full py-2 px-3 items-center rounded-lg transition-colors">
                <div className="flex flex-1 items-center">
                    <div className="flex w-4 h-4 bg-[#BD7DFF] rounded-sm mr-4"/>
                    <span className="text-black text-body2">ฟอสฟอรัส</span>
                </div>
                <div className="text-black text-body2">{food?.phosphorus || 0} ก.</div>
            </div>

            {/* โพแทสเซียม */}
            <div className="flex w-full py-2 px-3 items-center rounded-lg transition-colors">
                <div className="flex flex-1 items-center">
                    <div className="flex w-4 h-4 bg-[#BD7DFF] rounded-sm mr-4"/>
                    <span className="text-black text-body2">โพแทสเซียม</span>
                </div>
                <div className="text-black text-body2">{food?.potassium || 0} ก.</div>
            </div>
        </div>
        </div>
    </>
    
  );
};

export default DonutGraph;