import { useState } from "react";

type Tournament = {
    tournament_id: number;
    tournament_name: string;
    // date: string;
};

export default function TournamentSelector({
    tournaments,
    onSelect,
}: {
    tournaments: Tournament[];
    onSelect: (tournament: Tournament) => void;
}) {
    console.log("t", tournaments);

    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const filtered = tournaments.filter((t) =>
        t.tournament_name.toLowerCase().includes(query.toLowerCase())
    );
    // .sort(
    //     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    // );

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder="Tournament"
                value={query}
                onClick={() => {
                    setShowDropdown(true);
                }}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                }}
                onBlur={() => {
                    // Optional: delay to allow click
                    setTimeout(() => setShowDropdown(false), 100);
                }}
                className="w-full p-2 border rounded-md"
            />

            {showDropdown && filtered.length > 0 && (
                <ul className="text-black absolute z-10 w-full bg-gray-400 border rounded-md max-h-48 overflow-y-auto mt-1">
                    {filtered.map((tournament) => (
                        <li
                            key={tournament.tournament_id}
                            onMouseDown={() => {
                                setQuery(tournament.tournament_name);
                                setShowDropdown(false);
                                onSelect(tournament);
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-500"
                        >
                            {tournament.tournament_name} (
                            {tournament.tournament_name})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
