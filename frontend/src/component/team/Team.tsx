import { Player } from "../../lib/viewer/types/player_data";
import { PlayerCard } from "./PlayerCard";

type PlayersProps = {
    players: Player[];
};

export function Team({ players }: PlayersProps) {
    const teamName = players[0].team_clan_name;

    const justifyClass = players[0].side ? "text-start" : "text-end";
    console.log(players[0], justifyClass);

    return (
        <div className={`flex justify-center gap-10 p-4 h-full`}>
            <div className="flex flex-col justify-center h-full">
                {players.length > 0 &&
                    (!players[0].side ? (
                        <h2
                            className={`${justifyClass} text-orange-500 font-bold mb-2 text-2xl`}
                        >
                            <>{teamName}</>
                        </h2>
                    ) : (
                        <h2
                            className={`${justifyClass} text-blue-500 font-bold mb-2 text-2xl`}
                        >
                            <>{teamName}</>
                        </h2>
                    ))}

                {players.length === 0
                    ? Array.from({ length: 5 }).map((_, i) => (
                          <PlayerCard key={`placeholder-${i}`} loading />
                      ))
                    : players.map((player) => (
                          <PlayerCard key={player.name} player={player} />
                      ))}
            </div>
        </div>
    );
}
