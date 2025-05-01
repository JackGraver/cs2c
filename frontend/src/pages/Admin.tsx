import { useEffect, useState } from "react";

type Storage = {
    id: string;
    num_files: number;
    size: number;
};

type ParsedDemo = {
    demo_id: string;
    map_name: string;
    rounds: number;
    series_id: string;
    team1: string;
    team2: string;
    uploaded_at: string;
    storage?: Storage;
};

type GroupedDemos = Record<string, ParsedDemo[]>;

export default function Admin() {
    const [groupedDemos, setGroupedDemos] = useState<GroupedDemos>({});

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`http://127.0.0.1:8000/admin`);
            const data = await res.json();
            console.log(data);

            if (data.db_demos && data.storage) {
                const storageMap: Record<string, Storage> = Object.fromEntries(
                    Object.entries(data.storage).map(
                        ([key, value]: [string, any]) => [
                            key,
                            {
                                id: key,
                                num_files: value.num_files,
                                size: value.size,
                            },
                        ]
                    )
                );

                const grouped: GroupedDemos = {};

                for (const [seriesId, demos] of Object.entries(
                    data.db_demos
                ) as [string, Omit<ParsedDemo, "storage">[]][]) {
                    grouped[seriesId] = demos.map((demo) => ({
                        ...demo,
                        storage: storageMap[demo.demo_id],
                    }));
                }
                setGroupedDemos(grouped);
            }
        };

        fetchData();
    }, []);

    // useEffect(() => {
    //     console.log("d", demos);
    // }, [demos]);

    const handleDelete = async (demo_id: string) => {
        console.log("delete", demo_id);
        const res = await fetch(`http://127.0.0.1:8000/delete/${demo_id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            console.log("deleted");
        } else {
            console.log("delete failed");
        }
    };

    return (
        <div className="flex flex-col pt-14 space-y-6">
            {/* SERIES GROUPS */}
            {Object.entries(groupedDemos).map(([seriesId, seriesDemos]) => (
                <div
                    key={seriesId}
                    className="border border-gray-700 rounded-2xl bg-gray-800 p-4 space-y-4"
                >
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Series ID:{" "}
                        <span className="text-gray-300">{seriesId}</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {seriesDemos.map((f) => (
                            <div
                                key={f.demo_id}
                                className="rounded-xl border border-gray-600 bg-gray-900 p-4 shadow-md transition hover:shadow-lg"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {f.team1} vs {f.team2}
                                </h3>

                                <p className="text-sm text-gray-400 mb-1">
                                    <span className="font-medium text-gray-300">
                                        Map:
                                    </span>{" "}
                                    {f.map_name}
                                </p>
                                <p className="text-sm text-gray-400 mb-1">
                                    <span className="font-medium text-gray-300">
                                        Rounds:
                                    </span>{" "}
                                    {f.rounds}
                                </p>
                                <p className="text-sm text-gray-400 mb-1">
                                    <span className="font-medium text-gray-300">
                                        Uploaded:
                                    </span>{" "}
                                    {new Date(f.uploaded_at).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-400 mb-1">
                                    <span className="font-medium text-gray-300">
                                        Demo ID:
                                    </span>{" "}
                                    {f.demo_id}
                                </p>

                                <div className="mt-3 border-t border-gray-700 pt-2 flex items-start justify-between">
                                    <div>
                                        {f.storage ? (
                                            <>
                                                <p className="text-sm text-gray-400">
                                                    <span className="font-medium text-gray-300">
                                                        Files:
                                                    </span>{" "}
                                                    {f.storage.num_files}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    <span className="font-medium text-gray-300">
                                                        Size:
                                                    </span>{" "}
                                                    {(
                                                        f.storage.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-yellow-400">
                                                No storage data found.
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        className="text-red-500 hover:text-red-700 text-xl px-3 py-1 bg-gray-700 rounded-md ml-4 font-bold hover:bg-gray-600"
                                        onClick={() => handleDelete(f.demo_id)}
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* USERS PANEL */}
            <div className="p-4 border border-gray-500 rounded-md bg-gray-800 text-white">
                <h1 className="text-lg font-semibold">Users</h1>
            </div>

            {/* SYSTEM USAGE */}
            <div className="p-4 border border-gray-500 rounded-md bg-gray-800 text-white space-y-2">
                <h1 className="text-lg font-semibold">System Usage</h1>
                <h2>Disk usage</h2>
                <h2>CPU</h2>
            </div>

            {/* LOGS */}
            <div className="p-4 border border-gray-500 rounded-md bg-gray-800 text-white">
                <h1 className="text-lg font-semibold">Logs</h1>
            </div>
        </div>
    );
}
