import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type ParsedDemos = {
    demo_id: string;
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

    const [parsedDemos, setParsedDemos] = useState<ParsedDemos[]>([]);

    useEffect(() => {
        const fetchParsedDemos = async () => {
            const res = await fetch(`http://127.0.0.1:8000/`);
            const data = await res.json();
            if (data.demos) {
                setParsedDemos(data.demos);
            }
        };
        fetchParsedDemos();
    }, []);

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
                // navigate("/viewer");
                navigate(`/viewer?demo_id=${data.demo_id}`);
            } else {
                setError(data.message || "Failed to parse demo.");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Upload a .dem File</h1>
            <input type="file" accept=".dem" onChange={handleUpload} />
            {loading && <p className="mt-4 text-gray-400">Parsing demo...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {parsedDemos.length > 0 && (
                <div className="mt-8 text-left max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Parsed Demos</h2>
                    <table className="w-full border border-gray-600 rounded-lg text-sm">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-4 py-2 border-b border-gray-700" />
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Name
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Map
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Rounds
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Teams
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700">
                                    Uploaded
                                </th>
                                <th className="px-4 py-2 border-b border-gray-700 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedDemos.map((demo) => (
                                <tr
                                    key={demo.demo_id}
                                    className="border-b border-gray-700 hover:bg-gray-700/20"
                                >
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(
                                                        `http://127.0.0.1:8000/delete/${demo.demo_id}`,
                                                        {
                                                            method: "DELETE",
                                                        }
                                                    );

                                                    if (res.ok) {
                                                        // Optional: refresh or remove the deleted demo from state
                                                        setParsedDemos((prev) =>
                                                            prev.filter(
                                                                (d) =>
                                                                    d.demo_id !==
                                                                    demo.demo_id
                                                            )
                                                        );
                                                    } else {
                                                        console.error(
                                                            "Failed to delete demo"
                                                        );
                                                    }
                                                } catch (err) {
                                                    console.error(
                                                        "Error deleting demo:",
                                                        err
                                                    );
                                                }
                                            }}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                                            title="Delete"
                                        >
                                            X
                                        </button>
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
                                    </td>
                                    <td className="px-4 py-2 text-center space-x-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/viewer?demo_id=${demo.demo_id}`
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
