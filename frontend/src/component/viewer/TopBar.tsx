import { SeriesGame } from "../../lib/viewer/types/SeriesGame";
import { TickData } from "../../lib/viewer/types/TickData";

type TopBarProps = {
    currentTick: TickData | undefined;
    series: SeriesGame[];
    handleSwitchGame: (game: SeriesGame) => void;
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
}: TopBarProps) {
    const formatTime = (time: string | undefined) => {
        if (!time) return "0.00"; // Handle undefined time
        return time.startsWith("-") ? "0.00" : time; // Check for negative
    };

    return (
        <div className="w-full h-12 flex items-center justify-between px-4 text-white shadow-md">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm shadow">
                {formatTime(currentTick?.time)}
            </div>
            <div className="absolute top-2 right-2 flex flex-row gap-2">
                {series.map((game) => (
                    <img
                        key={game.id}
                        src={`map_icons/${game.map_name}.png`}
                        alt={game.map_name}
                        onClick={() => {
                            handleSwitchGame(game);
                        }}
                        className="w-8 h-8 object-cover cursor-pointer rounded"
                    />
                ))}
            </div>
        </div>
    );
}
