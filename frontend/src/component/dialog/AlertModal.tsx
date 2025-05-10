import React from "react";

type ErrorModalProps = {
    message: string;
    onClose: () => void;
};

export const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
    console.log("in", message);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
                <h2 className="text-lg font-bold mb-4 text-red-600">
                    Encountered an Error
                </h2>
                <p className="mb-4 text-black">{message}</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};
