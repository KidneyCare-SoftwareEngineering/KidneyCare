import { Icon } from "@iconify/react/dist/iconify.js"


export default function SearchBox() {
    return(
        <>
            <div className="flex justify-center items-center w-full gap-4 px-5">
                <div className="relative flex justify-center items-start flex-col w-8/12 ">
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2" icon="material-symbols:search" />
                    <input 
                    type="search" 
                    id="search" 
                    className="block border border-gray-300 rounded-lg w-full max-h-12 pl-10 p-4 text-sm text-gray-900" 
                    placeholder="ค้นหาอาหาร" 
                    required />
                </div>

                <div className="flex border border-grey300 justify-center items-center w-12 h-12 bg-white rounded-lg">
                    <Icon icon="mdi:camera" width="24"/>
                </div>

                <div className="flex border border-grey300 justify-center items-center w-12 h-12 bg-white rounded-lg">
                    <Icon icon="mdi:filter-outline" width="24"/>
                </div>
            </div>
        </>
    )
}