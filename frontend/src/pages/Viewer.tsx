// import { useState } from 'react'

// import "./App.css";

// import MapView from "../component/MapView"
import { Team } from "../component/team/Team";
// import Player from "./component/Player"
import { BottomBar } from "../component/BottomBar";
import { DemoPlayer } from "../component/viewer/DemoPlayer";
import { useEffect, useRef, useState } from "react";
import { TickData } from "../lib/viewer/types/tick_data";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type RoundInfo = {
    round_num: number;
    winner: "t" | "ct";
    loaded?: boolean;
};

const Viewer = () => {
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get("demo_id");
    const map = searchParams.get("map");

    const navigate = useNavigate();

    const [tickData, setTickData] = useState<TickData[]>([]);
    const [roundData, setRoundData] = useState<RoundInfo[]>([]);
    const [selectedRound, setSelectedRound] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState(true);

    const [currentTickIndex, setCurrentTickIndex] = useState(0);

    const [loading, setLoading] = useState(false);

    const roundCache = useRef<Record<number, TickData[]>>({});

    useEffect(() => {
        const fetchRounds = async () => {
            if (roundCache.current[selectedRound]) {
                setTickData(roundCache.current[selectedRound]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await fetch(
                    `http://127.0.0.1:8000/demo/${demoId}/round/${selectedRound}`
                );
                const data = await res.json();
                if (data.data) {
                    console.log(data.data);
                    roundCache.current[selectedRound] = data.data;
                    setTickData(data.data);
                }
                if (data.rounds) {
                    setRoundData((prev) => {
                        if (prev.length === 0 && data.rounds) {
                            return data.rounds.map((r: RoundInfo) =>
                                r.round_num === selectedRound
                                    ? { ...r, loaded: true }
                                    : r
                            );
                        }

                        return prev.map((r) =>
                            r.round_num === selectedRound
                                ? { ...r, loaded: true }
                                : r
                        );
                    });
                }
            } catch (err) {
                console.error("Error fetching round data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRounds();
    }, [selectedRound]);

    useEffect(() => {
        if (tickData.length == 0) return;

        if (currentTickIndex >= tickData.length) {
            setSelectedRound(selectedRound + 1);
            setCurrentTickIndex(0);
        }
    }, [currentTickIndex]);

    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Top Bar */}
            <div className="h-12 text-white flex items-center justify-center border-b border-gray-500">
                <button
                    onClick={() => navigate(`/`)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                    Home
                </button>
            </div>

            {/* Middle Section (fills remaining height) */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Team */}
                <div className="w-1/4 overflow-y-auto p-2">
                    {/* {tickData.length > 0 && (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => p.side === "ct"
                                ),
                            ]}
                        />
                    )} */}

                    {loading || !tickData[currentTickIndex]?.players ? (
                        <div>Loading...</div>
                    ) : (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => p.side === "ct"
                                ),
                            ]}
                        />
                    )}
                </div>

                {/* Viewer */}
                <div className="w-2/4 aspect-square bg-gray-800 flex items-center justify-center p-2 overflow-hidden">
                    <DemoPlayer
                        currentTick={tickData[currentTickIndex]}
                        previousTick={
                            currentTickIndex === 0
                                ? undefined
                                : tickData[currentTickIndex - 1]
                        }
                        isPlaying={isPlaying}
                        onAdvanceTick={() =>
                            setCurrentTickIndex((prev) => prev + 1)
                        }
                        map={map!}
                    />
                </div>

                {/* Right Team */}
                <div className="w-1/4 overflow-y-auto p-2">
                    {loading || !tickData[currentTickIndex]?.players ? (
                        <div>Loading...</div>
                    ) : (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => p.side === "t"
                                ),
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-28 border-t border-gray-500 text-white w-full">
                <BottomBar
                    rounds={roundData}
                    currentTickIndex={currentTickIndex}
                    totalTicks={tickData.length}
                    isPlaying={isPlaying}
                    onTickChange={setCurrentTickIndex}
                    togglePlay={togglePlay}
                    setSelectedRound={setSelectedRound}
                />
            </div>
        </div>
    );
};

export default Viewer;
