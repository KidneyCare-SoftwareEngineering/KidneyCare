import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import handleSearch from "@/Interfaces/handleSearch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";
import { FaSpinner } from "react-icons/fa";

const SearchBox: React.FC<handleSearch> = ({ onSearch, foodData, setFilteredFoodData }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const ingredientsList = [
    "ไข่", "นม", "หมู", "เนื้อ", "ปลา", "กุ้ง", "หมึก", "เห็ด",
    "หัวหอม", "กระเทียม", "กะเพรา", "ตับไก่", "เต้าหู้",
    "แครอท", "พริก", "มะนาว", "ฟักทอง", "มะเขือเทศ",
    "แตงกวา", "มะละกอ", "กะหล่ำปลี"
  ];
  
  const toggleIngredientFilter = (ingredient: string) => {
    if (activeFilters.includes(ingredient)) {
      updateFilters(activeFilters.filter(item => item !== ingredient));
    } else {
      updateFilters([...activeFilters, ingredient]);
    }
  };

  const updateFilters = (newFilters: string[]) => {
    const uniqueFilters = [...new Set(newFilters)];
    setActiveFilters(uniqueFilters);

    const filtered = foodData.filter(food =>
      uniqueFilters.every(filter =>
        food.recipe_name.toLowerCase().includes(filter.toLowerCase()) || 
        food.ingredients_eng.some(ingredient => ingredient.toLowerCase() === filter.toLowerCase())
      )
    );

    setFilteredFoodData(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); 
  };

  const handleApplySearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      updateFilters([...activeFilters, searchTerm.trim().toLowerCase()]);
      setSearchTerm(""); 
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setIsLoading(true); // เริ่มโหลด แสดง SpinLoader
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://detect.roboflow.com/se3-zhodg/1?api_key=CDt5EvLTSO3JyZJerIe2",
        { method: "POST", body: formData }
      );
      const result = await response.json();

      if (result.predictions.length > 0) {
        const detectedClasses = result.predictions.map(prediction => prediction.class.toLowerCase());
        updateFilters([...activeFilters, ...detectedClasses]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false); // โหลดเสร็จแล้ว ซ่อน SpinLoader
    }
  };

  const removeFilter = (filter: string) => {
    updateFilters(activeFilters.filter(item => item !== filter));
  };

  

  return (
    <div className="flex flex-col w-full gap-4 px-5">
      <div className="flex justify-center items-center gap-4">
        <div className="relative flex justify-center items-start flex-col w-8/12">
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2" icon="material-symbols:search" />
          <input
            type="search"
            className="block border border-grey300 bg-white rounded-lg w-full max-h-12 pl-10 p-4 text-sm text-gray-900"
            placeholder="ค้นหาอาหาร"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleApplySearch}
            required
          />
        </div>
        {/* ปุ่มอัปโหลดรูปภาพ */}
        <label className="flex border border-grey300 justify-center items-center w-12 h-12 bg-white rounded-lg cursor-pointer">
          <input type="file" className="hidden" onChange={handleImageUpload} />
          {isLoading ? (
            <FaSpinner className="animate-spin text-gray-500" size={24} /> // แสดง SpinLoader
          ) : (
            <Icon icon="mdi:camera" width="24" />
          )}
        </label>

        {/* ปุ่มเปิด Filter Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger className="flex border border-grey300 justify-center items-center w-12 h-12 bg-white rounded-lg">
            <Icon icon="mdi:filter-outline" width="24"/>
          </SheetTrigger>
          <SheetContent side="bottom" className="w-full h-10/12">
            <SheetHeader>
              <SheetTitle>ตัวเลือกการค้นหา</SheetTitle>
            </SheetHeader>

            {/* แสดงรายการวัตถุดิบ */}
            <div className="flex flex-wrap gap-2 mt-4 px-4">
              {ingredientsList.map((ingredient) => (
                <button
                  key={ingredient}
                  className={`px-3 py-1 border rounded-full text-sm font-bold ${
                    activeFilters.includes(ingredient)
                      ? "bg-orange-400 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => toggleIngredientFilter(ingredient)}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
          </div>


      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 bg-fillstrock text-gray-800 border border-orange300 rounded-full text-body2 font-bold cursor-pointer"
              onClick={() => removeFilter(filter)}
            >
              {filter}
              <Icon className="ml-2 text-red-500" icon="mdi:close-circle" width="16" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;