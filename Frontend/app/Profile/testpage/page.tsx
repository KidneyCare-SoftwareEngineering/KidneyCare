'use client'
import React, { useState } from 'react';

const ButtonGroup = () => {
  const [selectedGender, setSelectedGender] = useState(null);

  return (
    <div className="flex justify-center gap-0">
      {['ชาย', 'หญิง'].map((gender, index) => (
        <button
          key={gender}
          onClick={() => setSelectedGender(gender)}
          className={`w-[338px] h-[42px] px-4 p-[2px] rounded-tl-${index === 0 ? '[9px]' : 'none'} 
            border border-[#999999] 
            ${
              selectedGender === gender
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-black'
            } font-bold hover:bg-orange-600`}
        >
          {gender}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
