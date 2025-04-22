type RoundInfo = {
    round_num: number;
    winner: "t" | "ct";
    loaded?: boolean;
};

type BottomBarProps = {
    rounds: RoundInfo[];
    currentTickIndex: number;
    totalTicks: number;
    isPlaying: boolean;
    onTickChange: (tickIndex: number) => void;
    togglePlay: () => void;
    setSelectedRound: (round: number) => void;
};

export function BottomBar({
    rounds,
    currentTickIndex,
    totalTicks,
    isPlaying,
    onTickChange,
    togglePlay,
    setSelectedRound,
}: BottomBarProps) {
    const handleSliderMouseDown = () => {
        console.log("BB SMD");
        if (isPlaying && togglePlay) {
            togglePlay();
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("BB HS");
        const index = parseInt(e.target.value);
        onTickChange(index); // Notify parent (DemoViewer)
    };

    const handleRoundClick = (roundNum: number) => {
        setSelectedRound(roundNum);
        onTickChange(0);
    };

    return (
        <div className="w-full h-full px-4 py-2 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 w-full">
                <button
                    onClick={togglePlay}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                >
                    {isPlaying ? "Pause" : "Play"}
                </button>
                <input
                    type="range"
                    min={0}
                    max={totalTicks}
                    value={currentTickIndex}
                    onChange={handleSliderChange}
                    onMouseDown={handleSliderMouseDown}
                    className="w-full"
                />
            </div>

            <div className="flex gap-2 justify-center mt-2 flex-wrap items-center">
                {rounds.map((round, i) => (
                    <div key={i} className="flex items-center">
                        <button
                            onClick={() => handleRoundClick(round.round_num)}
                            className={`px-4 py-2 rounded text-white
                    ${
                        round.loaded
                            ? round.winner === "t"
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-500 hover:bg-gray-600"
                    }
                    `}
                        >
                            {round.round_num}
                        </button>
                        {i === 11 && (
                            <div className="mx-4 h-6 w-px bg-gray-400 self-center" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
