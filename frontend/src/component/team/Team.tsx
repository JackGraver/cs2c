import { Player } from "../../lib/viewer/types/player_data";
import { PlayerCard } from "./PlayerCard";

type PlayersProps = {
    players: Player[] | undefined;
    ct_team: boolean;
};

export function Team({ players, ct_team }: PlayersProps) {
    console.log(players);
    let teamName = "---";

    let teamColour = !players
        ? " text-pink-400 "
        : ct_team
        ? " text-blue-400 "
        : " text-orange-400 ";

    let teamPosition = ct_team ? " text-end " : " text-start ";

    let teamStyle = "font-bold mb-2 text-2xl " + teamColour + teamPosition;

    const loading = players === undefined;

    if (!loading) {
        teamName = "TEMP 4 BACKEND"; //players[0].team_clan_name;
    }

    return (
        <div className={`flex justify-center gap-10 p-4 h-full`}>
            <div className="flex flex-col justify-center h-full">
                <h2 className={teamStyle}>
                    <>{teamName}</>
                </h2>

                {/* {players.length > 0 &&
                    (!players[0].is_ct ? (
    
                        </h2>
                    ) : (
                        <h2
                            className={`${justifyClass} text-blue-500 font-bold mb-2 text-2xl`}
                        >
                            <>{teamName}</>
                        </h2>
                    ))} */}

                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                          <PlayerCard key={`unloading-${i}`} loading />
                      ))
                    : players.map((player) => (
                          <PlayerCard key={player.name} player={player} />
                      ))}
            </div>
        </div>
    );
}
