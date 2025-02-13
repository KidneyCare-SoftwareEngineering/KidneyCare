import handleSearch from "@/Interfaces/handleSearch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet"
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js"

const SearchBox: React.FC<handleSearch> = ({onSearch}) => {

  const [modelIngredient, setModelIngredient] = useState([])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("Hello from uploadIMG")
    try {
      const response = await fetch(
        "https://detect.roboflow.com/se3-zhodg/1?api_key=CDt5EvLTSO3JyZJerIe2",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("Detection Result:", result);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  
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
            onChange={handleSearch}
            required 
          />
        </div>
        <label className="flex border border-grey300 justify-center items-center w-12 h-12 bg-white rounded-lg cursor-pointer">
          <input type="file" className="hidden" onChange={handleImageUpload} />
          <Icon icon="mdi:camera" width="24" />
        </label>

        {/* Filter Slide */}
        <Sheet>
          <SheetContent side="bottom" className="w-full h-10/12">
              <SheetHeader>
                <SheetTitle>ตัวเลือกการค้นหา</SheetTitle>
                <SheetDescription>

                  <span className="flex w-full justify-start items-center text-body1 font-bold text-black">
                    ประเภทอาหาร
                  </span>

                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          
            <SheetTrigger className="flex border border-grey300 justify-center items-center w-12 h-12 bg-white rounded-lg">
              <Icon icon="mdi:filter-outline" width="24"/>
            </SheetTrigger>
        </Sheet>
      </div>
    </>
  )
}

export default SearchBox