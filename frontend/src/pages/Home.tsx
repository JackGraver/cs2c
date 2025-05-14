import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPicker } from "../component/filtering/MapPicker";
import parse from "parse-svg-path";

type Series = {
    series_id: string;
    demos: ParsedDemos[];
};

type ParsedDemos = {
    demo_id: string;
    series_id: string;
    // demo_name: string;
    map_name: string;
    rounds: number;
    team1: string;
    team2: string;
    uploaded_at: string;
};

export default function Home() {
    const navigate = useNavigate();

    const [parsedDemos, setParsedDemos] = useState<Series[]>([]);
    const [noDemos, setNoDemos] = useState(false);

    const [mapFilter, setMapFilter] = useState<string | null>(null);
    const [team1Filter, setTeam1Filter] = useState("");
    const [team2Filter, setTeam2Filter] = useState("");

    useEffect(() => {
        const fetchParsedDemos = async () => {
            const res = await fetch(`http://127.0.0.1:8080/`);
            const data = await res.json();
            console.log(data);
            if (data.demos) {
                console.log(data.demos);
                if (Object.keys(data.demos).length === 0) {
                    setNoDemos(true);
                    return;
                }

                setNoDemos(false);
                const transformed: Series[] = Object.entries(data.demos).map(
                    ([series_id, demos]: [string, any]) => ({
                        series_id,
                        demos: demos.map((d: any) => ({
                            demo_id: d.id,
                            series_id, // attach the series_id here
                            demo_name: d.name,
                            map_name: d.map_name,
                            rounds: d.rounds,
                            team1: d.team1,
                            team2: d.team2,
                            uploaded_at: d.uploaded_at,
                        })),
                    })
                );

                setParsedDemos(transformed);
            }
        };
        fetchParsedDemos();
    }, []);

    const teamMatches = (teamName: string, filter: string) =>
        !filter || teamName.toLowerCase().includes(filter.toLowerCase());

    const filteredSeries = parsedDemos
        .filter((series) => {
            if (!series.demos.length) return false;

            const demo = series.demos[0];

            const mapMatch =
                !mapFilter ||
                series.demos.some(
                    (demo) =>
                        demo.map_name.toLowerCase() === mapFilter.toLowerCase()
                );

            const team1Match =
                teamMatches(demo.team1, team1Filter) ||
                teamMatches(demo.team2, team1Filter);

            const team2Match =
                teamMatches(demo.team1, team2Filter) ||
                teamMatches(demo.team2, team2Filter);

            return mapMatch && team1Match && team2Match;
        })
        .sort((a, b) => {
            const dateA = new Date(a.demos[0].uploaded_at).getTime();
            const dateB = new Date(b.demos[0].uploaded_at).getTime();
            return dateB - dateA; // descending
        });

    return (
        <div className="p-8 text-center">
            {noDemos && (
                <div className="text-center mt-8">
                    <p className="text-lg text-gray-300 mb-4">
                        What??? No demos available?
                    </p>
                    <button
                        onClick={() => navigate("/upload")}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition duration-200"
                    >
                        Go Upload one!
                    </button>
                </div>
            )}

            {parsedDemos.length > 0 && (
                <div className="mt-8 max-w-6xl mx-auto text-white px-4">
                    {/* Filter Section */}
                    <div className=" rounded-lg p-4 mb-6 flex flex-row border border-gray-500">
                        <MapPicker
                            selectedMap={mapFilter}
                            onSelectedMapChange={setMapFilter}
                        />

                        <input
                            type="text"
                            placeholder="Filter by Team 1"
                            value={team1Filter}
                            onChange={(e) => setTeam1Filter(e.target.value)}
                            className="flex-1 p-2 rounded text-white placeholder-gray-400 border border-gray-500"
                        />
                        <input
                            type="text"
                            placeholder="Filter by Team 2"
                            value={team2Filter}
                            onChange={(e) => setTeam2Filter(e.target.value)}
                            className="flex-1 p-2 rounded text-white placeholder-gray-400 border border-gray-500"
                        />
                    </div>

                    {/* Series Groups */}
                    <div className="space-y-6">
                        {filteredSeries.map((series) => {
                            const demo = series.demos[0];
                            const team1Highlight =
                                team1Filter &&
                                demo.team1
                                    .toLowerCase()
                                    .includes(team1Filter.toLowerCase());
                            const team2Highlight =
                                team2Filter &&
                                demo.team2
                                    .toLowerCase()
                                    .includes(team2Filter.toLowerCase());

                            return (
                                <div
                                    key={series.series_id}
                                    className="rounded-lg p-6 border border-gray-500 space-y-4"
                                >
                                    {/* Header Section */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        {/* Teams and Date */}
                                        <div className="flex flex-col sm:items-end text-white text-lg">
                                            <div className="flex flex-wrap gap-2 font-semibold">
                                                <span
                                                    className={
                                                        team1Highlight
                                                            ? "text-pink-400"
                                                            : ""
                                                    }
                                                >
                                                    {demo.team1}
                                                </span>
                                                <span>vs</span>
                                                <span
                                                    className={
                                                        team2Highlight
                                                            ? "text-pink-400"
                                                            : ""
                                                    }
                                                >
                                                    {demo.team2}
                                                </span>
                                                <span className="text-gray-400 flex-end">
                                                    (
                                                    {new Date(
                                                        demo.uploaded_at
                                                    ).toLocaleDateString()}
                                                    )
                                                </span>
                                            </div>
                                        </div>
                                        {/* Tournament Name */}
                                        <div className="text-lg font-bold text-white">
                                            Tournament
                                        </div>
                                    </div>

                                    <div className="flex flex-row">
                                        {series.demos.map((game) => {
                                            const isMapMatch =
                                                mapFilter &&
                                                game.map_name.toLowerCase() ===
                                                    mapFilter.toLowerCase();

                                            return (
                                                <div
                                                    onClick={() =>
                                                        navigate(
                                                            `/viewer?demo_id=${game.demo_id}&map=${game.map_name}&round=1`
                                                        )
                                                    }
                                                    key={game.demo_id}
                                                    className={`flex-1 rounded-md p-4 mr-2 flex items-center justify-between transition border border-gray-500 ${
                                                        isMapMatch
                                                            ? "bg-gray-600"
                                                            : "bg-gray-700 hover:bg-gray-600"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={`map_icons/${game.map_name}.png`}
                                                            alt={game.map_name}
                                                            className="w-12 h-12"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-lg uppercase">
                                                                {game.map_name}
                                                            </div>
                                                            <div className="text-sm text-gray-300">
                                                                {game.rounds}{" "}
                                                                rounds
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
