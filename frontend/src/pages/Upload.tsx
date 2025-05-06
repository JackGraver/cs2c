import { useEffect, useState } from "react";
import FileDropper from "../component/upload/FileDropper";
import { useNavigate } from "react-router-dom";
import TournamentSelector from "../component/upload/TournamentSelector";

export default function Upload() {
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [currentStage, setCurrentStage] = useState(0); // Track the current stage (0-3)
    const [stageProgress, setStageProgress] = useState(0); // Progress within the current stage
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        team1: "",
        team2: "",
    });
    const [ready, setReady] = useState<string>("");

    const stages = [
        "File Transfer",
        "Demo Processing",
        "Processing Rounds",
        "Finishing Touches",
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const processDemo = async () => {
            if (file) {
                setIsProcessing(true);
                setCurrentStage(0);
                setStageProgress(0);

                // Simulate each stage
                for (let stage = 0; stage < stages.length; stage++) {
                    setCurrentStage(stage);
                    for (let progress = 0; progress <= 100; progress += 10) {
                        setStageProgress(progress);
                        await new Promise((resolve) =>
                            setTimeout(resolve, 200)
                        );
                    }
                }

                // Simulate backend response
                const formData = new FormData();
                formData.append("file", file);
                console.log("Uploading file:", file.name);
                const res = await fetch("http://127.0.0.1:8000/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setIsProcessing(false);
                    setReady(
                        `/viewer?demo_id=${data.demo_id}&map=${data.map}&round=1`
                    );
                    setCurrentStage(stages.length - 1);
                    setStageProgress(100);
                }
            }
        };
        processDemo();
    }, [file]);

    return (
        <div className="p-8 max-w-4xl mx-auto pt-24 space-y-10">
            <FileDropper setFile={setFile} />

            {/* Progress Bar */}
            <div className="space-y-4">
                <h2 className="text-white text-lg font-semibold">
                    Upload Progress
                </h2>
                <div className="space-y-2">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                            className="bg-blue-500 h-4 rounded-full transition-all"
                            style={{
                                width: `${
                                    (currentStage * 100 + stageProgress) /
                                    stages.length
                                }%`,
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        {stages.map((stage, index) => (
                            <span
                                key={index}
                                className={
                                    index === currentStage
                                        ? "text-white font-bold"
                                        : ""
                                }
                            >
                                {stage}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Demo Info Inputs */}
            <div className="space-y-4">
                <h2 className="text-white text-lg font-semibold">
                    Demo Information{" "}
                    <span className="text-gray-400 text-sm">(optional)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Tournament Selector styled to match */}
                    <div className="col-span-1 md:col-span-2">
                        <TournamentSelector
                            tournaments={[]}
                            onSelect={() => {}}
                            disabled={!file}
                        />
                    </div>
                    <input
                        type="text"
                        name="date"
                        placeholder="Date"
                        value={formData.date}
                        onChange={handleInputChange}
                        disabled={!file}
                        className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <input
                        type="text"
                        name="team1"
                        placeholder="Team 1"
                        value={formData.team1}
                        onChange={handleInputChange}
                        disabled={!file}
                        className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <input
                        type="text"
                        name="team2"
                        placeholder="Team 2"
                        value={formData.team2}
                        onChange={handleInputChange}
                        disabled={!file}
                        className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                </div>
            </div>

            {/* Loading Spinner */}
            {isProcessing && (
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white">Processing file...</span>
                </div>
            )}
            {ready !== "" && (
                <div className="flex justify-center">
                    <button
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-300 transition-all duration-200 font-semibold text-lg"
                        onClick={() => {
                            navigate(ready);
                        }}
                    >
                        ▶ Watch Demo
                    </button>
                </div>
            )}
        </div>
    );
}
