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
    demo_name: string;
    map_name: string;
    rounds: number;
    team1: string;
    team2: string;
    uploaded_at: string;
};

export default function Home() {
    const navigate = useNavigate();

    const [parsedDemos, setParsedDemos] = useState<Series[]>([]);

    const [mapFilter, setMapFilter] = useState<string | null>(null);
    const [team1Filter, setTeam1Filter] = useState("");
    const [team2Filter, setTeam2Filter] = useState("");

    useEffect(() => {
        const fetchParsedDemos = async () => {
            const res = await fetch(`http://127.0.0.1:8000/`);
            const data = await res.json();
            if (data.demos) {
                console.log(data.demos);
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

    useEffect(() => {
        console.log("p", mapFilter);
        console.log(parsedDemos);
    }, [mapFilter]);

    const filteredSeries = parsedDemos
        .filter((series) => {
            if (!series.demos.length) return false;

            const seriesMaps = series.demos.map((demo) =>
                demo.map_name.toLowerCase()
            );

            const mapMatch =
                !mapFilter || seriesMaps.includes(mapFilter.toLowerCase());

            const team1Match = series.demos[0].team1
                .toLowerCase()
                .includes(team1Filter.toLowerCase());
            const team2Match = series.demos[0].team2
                .toLowerCase()
                .includes(team2Filter.toLowerCase());

            return mapMatch && team1Match && team2Match;
        })
        .sort((a, b) => {
            const dateA = new Date(a.demos[0].uploaded_at).getTime();
            const dateB = new Date(b.demos[0].uploaded_at).getTime();
            return dateB - dateA; // descending
        });

    return (
        <div className="p-8 text-center">
            <h1 className="text-8xl font-bold m-16">CS2C</h1>

            {parsedDemos.length > 0 && (
                <div className="mt-8 text-left max-w-2xl mx-auto">
                    <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-between">
                        {/* <input
                            type="text"
                            placeholder="Filter by Map"
                            value={mapFilter}
                            onChange={(e) => setMapFilter(e.target.value)}
                            className="p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
                        /> */}
                        <MapPicker
                            selectedMap={mapFilter}
                            onSelectedMapChange={setMapFilter}
                        />
                        <input
                            type="text"
                            placeholder="Filter by Team 1"
                            value={team1Filter}
                            onChange={(e) => setTeam1Filter(e.target.value)}
                            className="p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
                        />
                        <input
                            type="text"
                            placeholder="Filter by Team 2"
                            value={team2Filter}
                            onChange={(e) => setTeam2Filter(e.target.value)}
                            className="p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
                        />
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Parsed Demos</h2>
                    <table className="w-full border border-gray-600 rounded-lg text-sm">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Team A
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Team B
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Maps
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Date
                                </th>
                                {/* <th className="px-4 py-2 border-b border-gray-700">
                                    Uploaded
                                </th> */}
                                <th className="px-4 py-2 border-b border-gray-700 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSeries.map((series) => (
                                <tr
                                    key={series.series_id}
                                    className="border-b border-gray-700 hover:bg-gray-700/20"
                                >
                                    <td className="px-4 py-2">
                                        {series.demos[0].team1}
                                    </td>
                                    <td className="px-4 py-2">
                                        {series.demos[0].team2}
                                    </td>
                                    <td>
                                        <div className="flex flex-row">
                                            {series.demos.map((game) => (
                                                <img
                                                    key={game.demo_id}
                                                    src={`map_icons/${game.map_name}.png`}
                                                    className="w-8 h-8"
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(
                                            series.demos[0].uploaded_at
                                        ).toDateString()}
                                    </td>

                                    {/* <td className="px-4 py-2">
                                        {demo.uploaded_at}
                                    </td>

                                    <td className="px-4 py-2">
                                        {demo.demo_name}
                                    </td>
                                    <td className="px-4 py-2">
                                        {demo.map_name}
                                    </td>
                                    <td className="px-4 py-2">{demo.rounds}</td>
                                    <td className="px-4 py-2">
                                        {demo.team1} vs {demo.team2}
                                    </td>
                                    <td className="px-4 py-2">
                                        {new Date(
                                            demo.uploaded_at
                                        ).toLocaleString()}
                                    </td>*/}
                                    <td className="px-4 py-2 text-center space-x-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/viewer?demo_id=${series.demos[0].demo_id}&map=${series.demos[0].map_name}&round=1`
                                                )
                                            }
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
