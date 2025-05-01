import React, { useCallback, useState } from "react";

export default function FileDropper({
    setFile,
}: {
    setFile: (file: File) => void;
}) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                setFile(file);
            }
        },
        [setFile]
    );

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-gray-400
                ${
                    isDragging
                        ? "bg-gray-700 border-gray-400"
                        : "bg-[#2c2c2c] border-gray-600"
                }
            `}
        >
            <p className="text-white">
                Drag and drop your file here, or click to select
            </p>
            <input
                type="file"
                accept=".dem,.zip,.rar,.gz"
                className="hidden"
                id="fileInput"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFile(file);
                }}
            />
            <label
                htmlFor="fileInput"
                className="mt-4 inline-block cursor-pointer px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
                Browse Files
            </label>
        </div>
    );
}
