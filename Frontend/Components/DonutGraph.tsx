import { Doughnut } from "react-chartjs-2";
import {Chart ,ArcElement, Legend} from "chart.js";

Chart.register(ArcElement);

interface Donut {
    waitforback:any
}

const DonutGraph: React.FC<{donut:Donut}> = () =>  {

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
        <p className="flex justify-center items-center text-heading3 font-bold p-4">
            ข้อมูลสารอาหาร
        </p>

        <div className="flex w-full h-fit bg-white mt-2 px-3 justify-center items-center">
            <div className="relative w-44 h-44">
                <Doughnut data={data} options={options} />
                <div className="absolute top-1/2 left-1/2  transform -translate-x-1/2 -translate-y-1/2 text-center animate-fadeIn ">
                    <p className="m-0 text-body1 font-bold">354</p>
                    <p className="m-0 text-body1">แคลอรี่</p>
                </div>
            </div>
            <div className="flex w-full pl-2 flex-col">
                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#79A3FF] mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* คาร์โบไฮเดรต */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#26DFBC] mr-4 justify-center items-center "/>
                        คาร์โบไฮเดรต
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#FF8568] mr-4 justify-center items-center "/>
                        วิตามิน
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#FFB700] mr-4 justify-center items-center "/>
                        ไขมัน
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#BD7DFF] mr-4 justify-center items-center "/>
                        โซเดียม
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#BD7DFF] mr-4 justify-center items-center "/>
                        ฟอสฟอรัส
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#BD7DFF] mr-4 justify-center items-center "/>
                        โพแทสเซียม
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-9/12 justify-start items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-[#17C6ED] mr-4 justify-center items-center "/>
                        น้ำ
                    </div>
                    <div className="flex w-3/12 justify-center items-center line-clamp-1">25 ก.</div>
                </div>
            </div>
        </div>
    </>
    
  );
};

export default DonutGraph;