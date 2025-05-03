import { useEffect, useState } from "react";
import FileDropper from "../component/upload/FileDropper";
import TournamentSelector from "../component/upload/TournamentSelector";
import { useNavigate } from "react-router-dom";

type Tournament = {
    tournament_id: number;
    tournament_name: string;
    // date: string;
};

type Map = {
    map: string;
    team1: string;
    team2: string;
};

export default function Upload() {
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);

    const [maps, setMaps] = useState<Map[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    const getTodayDate = () => {
        return new Date().toISOString().split("T")[0]; // format: 'YYYY-MM-DD'
    };

    useEffect(() => {
        const processDemo = async () => {
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("http://127.0.0.1:8000/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    navigate(
                        `/viewer?demo_id=${data.demo_id}&map=${data.map}&round=1`
                    );
                }
            }
        };
        processDemo();
    }, [file]);

    // const onFileSelect = (file: File) => {};
    // useEffect(() => {
    //     const sendFile = async () => {
    //         if (file) {
    //             const formData = new FormData();
    //             formData.append("file", file);

    //             const res = await fetch("http://127.0.0.1:8000/init_upload", {
    //                 method: "POST",
    //                 body: formData,
    //             });

    //             const data = await res.json();

    //             if (data) {
    //                 console.log(data);
    //                 setMaps(data.maps);
    //                 setTournaments(data.tournaments);
    //             }
    //         }
    //     };
    //     sendFile();
    // }, [file]);

    return (
        <div className="p-8 max-w-xl mx-auto space-y-6 pt-24">
            <div>
                <FileDropper setFile={setFile} />
            </div>

            {maps.length > 0 && tournaments && (
                <div>
                    <div className="w-full bg-gray-300 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: "69%" }}
                        />
                    </div>
                    <div className="space-y-4 flex flex-col">
                        <div className="flex flex-row">
                            <TournamentSelector
                                tournaments={tournaments}
                                onSelect={(t) =>
                                    console.log("Selected tournament:", t)
                                }
                            />
                            <input
                                type="date"
                                value={getTodayDate()}
                                onChange={() => {}}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <h2>Maps</h2>
                        {maps.map((m, i) => (
                            <div className="flex flex-row space-x-2" key={i}>
                                <input
                                    type="text"
                                    placeholder="Map"
                                    value={m.map}
                                    onChange={() => {}}
                                    className="w-full p-2 border rounded-md"
                                />
                                <input
                                    type="text"
                                    placeholder="Team 1"
                                    value={m.team1}
                                    onChange={() => {}}
                                    className="w-full p-2 border rounded-md"
                                />
                                <input
                                    type="text"
                                    placeholder="Team 2"
                                    value={m.team2}
                                    onChange={() => {}}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                    {/* 
                    <div className="flex justify-center items-center h-32">
                        <button
                            className="bg-gray-500 p-2 px-3 rounded-md hover:bg-gray-600"
                            onClick={processDemo}
                        >
                            Submit
                        </button>
                    </div> */}
                </div>
            )}
        </div>
    );
}
