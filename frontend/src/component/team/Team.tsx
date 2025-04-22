import { Player } from "../../lib/viewer/types/player_data";
import { PlayerCard } from "./PlayerCard";

type PlayersProps = {
  players: Player[];
};

export function Team({ players }: PlayersProps) {
  return (
    <div className="flex justify-center gap-10 p-4">
      <div>
        <h2 className="text-center text-blue-400 font-bold mb-2">
          Counter-Terrorists
        </h2>
        {players.map((player) => (
          <PlayerCard key={player.name} p={player} />
        ))}
      </div>
    </div>
  );
}
