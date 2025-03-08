import React from "react";

interface ConfirmDeletePopupProps {
    onClose: () => void;
    onConfirm: () => void;
    type: "time" | "image";
    times: string[];
    showDeletePopup: { type: "time" | "image"; index: number | null };
}

const ConfirmDeletePopup: React.FC<ConfirmDeletePopupProps> = ({
    onClose,
    onConfirm,
    type,
    times,
    showDeletePopup,
}) => {
    if (showDeletePopup.type !== "time" && showDeletePopup.type !== "image") {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-80 h-80 shadow-lg flex items-center justify-center flex-col space-y-4">
                <h2 className="text-2xl font-semibold text-center text-gray-800">
                    {showDeletePopup.type === "time" && showDeletePopup.index !== null ? (
                        `คุณต้องการลบเวลา ${times[showDeletePopup.index]} ออกใช่หรือไม่?`
                    ) : (
                        "คุณต้องการลบรูปภาพนี้ใช่หรือไม่?"
                    )}
                </h2>

                <div className="mt-6 flex justify-center items-center space-x-2 w-64 h-14">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 w-full h-14 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 w-full h-14 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        ลบ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeletePopup;