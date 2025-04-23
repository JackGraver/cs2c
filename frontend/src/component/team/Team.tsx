import { Player } from "../../lib/viewer/types/player_data";
import { PlayerCard } from "./PlayerCard";

type PlayersProps = {
    players: Player[];
};

export function Team({ players }: PlayersProps) {
    return (
        <div className="flex justify-center gap-10 p-4 h-full">
            <div className="flex flex-col justify-center h-full">
                {players.length > 0 &&
                    (players[0].side === "t" ? (
                        <h2 className="text-center text-orange-500 font-bold mb-2">
                            Terrorists
                        </h2>
                    ) : (
                        <h2 className="text-center text-blue-500 font-bold mb-2">
                            Counter-Terrorists
                        </h2>
                    ))}

                {players.length === 0
                    ? Array.from({ length: 5 }).map((_, i) => (
                          <PlayerCard key={`placeholder-${i}`} loading />
                      ))
                    : players.map((player) => (
                          <PlayerCard key={player.name} p={player} />
                      ))}
            </div>
        </div>
    );
}
