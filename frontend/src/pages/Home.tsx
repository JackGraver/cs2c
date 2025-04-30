import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // const [parsedDemos, setParsedDemos] = useState<ParsedDemos[]>([]);
    const [parsedDemos, setParsedDemos] = useState<Series[]>([]);

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
        console.log("p", parsedDemos);
    }, [parsedDemos]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setError(null); // reset error

        try {
            const res = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok && data.success) {
                navigate(
                    `/viewer?demo_id=${data.demo_id}&map=${data.map}&round=1`
                );
            } else {
                setError(data.message || "Failed to parse demo.");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An unexpected error occurred.");
        }
    };

    const [mapFilter, setMapFilter] = useState("");
    const [team1Filter, setTeam1Filter] = useState("");
    const [team2Filter, setTeam2Filter] = useState("");

    const filteredSeries = parsedDemos.filter((series) => {
        return series.demos.length > 0;
    });

    // const filteredDemos = allDemos.filter((demo) => {
    //     return (
    //         demo.map_name.toLowerCase().includes(mapFilter.toLowerCase()) &&
    //         demo.team1.toLowerCase().includes(team1Filter.toLowerCase()) &&
    //         demo.team2.toLowerCase().includes(team2Filter.toLowerCase())
    //     );
    // });

    return (
        <div className="p-8 text-center">
            <h1 className="text-8xl font-bold m-16">CS2C</h1>
            <button
                onClick={() => navigate("/upload")}
                className="bg-[#2c2c2c] text-white text-lg px-6 py-3 rounded-md hover:bg-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
                Upload Demo(s)
            </button>
            {/* <h1 className="text-2xl font-bold mb-4">Upload a .dem File</h1>
            <input type="file" accept=".dem" onChange={handleUpload} /> */}
            {loading && <p className="mt-4 text-gray-400">Parsing demo...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {parsedDemos.length > 0 && (
                <div className="mt-8 text-left max-w-2xl mx-auto">
                    <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-between">
                        <input
                            type="text"
                            placeholder="Filter by Map"
                            value={mapFilter}
                            onChange={(e) => setMapFilter(e.target.value)}
                            className="p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
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
