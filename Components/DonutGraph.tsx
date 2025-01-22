import { Doughnut } from "react-chartjs-2";
import {Chart ,ArcElement, Legend} from "chart.js";

Chart.register(ArcElement);

const DonutGraph: React.FC<> = () =>  {

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

        <div className="flex w-full h-fit bg-white mt-2 px-8 justify-center items-center">
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
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>

                {/* โปรตีน */}
                <div className="flex w-full h-8 justify-center items-center ">
                    <div className="flex w-4/6 justify-center items-center line-clamp-1">
                        <div className="flex w-4 h-4 bg-black mr-4 justify-center items-center "/>
                        โปรตีน
                    </div>
                    <div className="flex w-2/6 justify-center items-center line-clamp-1">25 ก.</div>
                </div>
            </div>
        </div>
    </>
    
  );
};

export default DonutGraph;