import { useEffect } from "react";
import { RoundData } from "../../lib/viewer/types/RoundData";
import RoundScroller from "./RoundScroller";

type BottomBarProps = {
    rounds: RoundData[];
    currentTickIndex: number;
    totalTicks: number;
    isPlaying: boolean;
    onTickChange: (tickIndex: number) => void;
    togglePlay: () => void;
    speed: number;
    changeSpeed: () => void;
    setSelectedRound: (round: number) => void;
};

export function BottomBar({
    rounds,
    currentTickIndex,
    totalTicks,
    isPlaying,
    onTickChange,
    speed,
    changeSpeed,
    togglePlay,
    setSelectedRound,
}: BottomBarProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === " " || event.key === "Space") {
                togglePlay();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    // console.log("bb", rounds);
    const handleSliderMouseDown = () => {
        if (isPlaying && togglePlay) {
            togglePlay();
        }
    };

    const handleSliderMouseUp = () => {
        if (!isPlaying && togglePlay) {
            togglePlay();
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value);
        onTickChange(index); // Notify parent (DemoViewer)
    };

    const handleRoundClick = (roundNum: number) => {
        setSelectedRound(roundNum);
        onTickChange(0);
    };

    return (
        <div className="w-full h-full px-4 py-2 space-y-2 space flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 w-full">
                <span
                    onClick={changeSpeed}
                    className="cursor-pointer text-sm text-gray-200 hover:underline select-none"
                >
                    {speed}x
                </span>
                <button
                    onClick={() => {
                        togglePlay();
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                >
                    {isPlaying ? (
                        <img
                            src="/icons/pause.svg"
                            alt="Pause"
                            className="w-6 h-6 scale-150" // scales the SVG 1.5x without changing button padding
                        />
                    ) : (
                        <img
                            src="/icons/play.svg"
                            alt="Play"
                            className="w-6 h-6 scale-150"
                        />
                    )}
                </button>
                <input
                    type="range"
                    min={0}
                    max={totalTicks}
                    value={currentTickIndex}
                    onChange={handleSliderChange}
                    onMouseDown={handleSliderMouseDown}
                    onMouseUp={handleSliderMouseUp}
                    className="w-full"
                />
            </div>

            <RoundScroller
                rounds={rounds}
                handleRoundClick={handleRoundClick}
            />
        </div>
    );
}
