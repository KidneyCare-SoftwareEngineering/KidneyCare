import React, { useState, useEffect } from "react";

interface TimeInputPopupProps {
  onClose: () => void;
  onSave: (time: string) => void;
}

const TimeInputPopup: React.FC<TimeInputPopupProps> = ({ onClose, onSave }) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 7);
    const formattedTime = now.toISOString().substring(11, 16);
    setTime(formattedTime);
  }, []);

  const handleSave = () => {
    onSave(time);
    onClose();
  };


  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl w-72 h-72 shadow-lg flex items-center justify-center flex-col space-y-4">
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            เพิ่มเวลา
          </h2>

          <div className="mt-4 flex items-center justify-center">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-64 h-24 p-3 border border-gray-300 rounded-lg text-center text-4xl outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="mt-6 flex justify-center items-center space-x-2 w-64  h-14">
            <button
              onClick={onClose}
              className="px-4 py-2 w-full  h-14 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 w-full  h-14 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeInputPopup;
