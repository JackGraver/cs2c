import { SeriesGame } from "../../lib/viewer/types/SeriesGame";
import { TickData } from "../../lib/viewer/types/TickData";

type TopBarProps = {
    currentTick: TickData | undefined;
    series: SeriesGame[];
    handleSwitchGame: (game: SeriesGame) => void;
    score_ct: number;
    score_t: number;
};

/*
Teams
Score
Time
Round
Maps (and who won)

*/
export default function TopBar({
    currentTick,
    series,
    handleSwitchGame,
    score_ct,
    score_t,
}: TopBarProps) {
    const formatTime = (time: string | undefined) => {
        if (!time) return "0.00"; // Handle undefined time
        return time.startsWith("-") ? "0.00" : time; // Check for negative
    };

    return (
        <div className="w-full h-12 flex items-center justify-between px-4 text-white">
            {/* Centered Scores and Time */}
            <div className="flex items-center justify-center gap-4 mx-auto">
                {/* Left Score */}
                <div className="text-blue-500 text-xl font-bold">
                    {score_ct}
                </div>

                {/* Current Time */}
                <div className="text-white text-lg font-semibold select-none">
                    {formatTime(currentTick?.logical_time)}
                </div>

                {/* Right Score */}
                <div className="text-orange-500 text-xl font-bold">
                    {score_t}
                </div>
            </div>

            {/* Map Icons */}
            <div className="absolute top-2 right-4 flex flex-row gap-2">
                {series.map((game) => (
                    <img
                        key={game.id}
                        src={`map_icons/${game.map_name}.png`}
                        alt={game.map_name}
                        onClick={() => {
                            handleSwitchGame(game);
                        }}
                        className="w-8 h-8 object-cover cursor-pointer rounded hover:scale-110 transition-transform"
                    />
                ))}
            </div>
        </div>
    );
}
