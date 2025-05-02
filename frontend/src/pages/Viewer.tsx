// import { useState } from 'react'

// import "./App.css";

// import MapView from "../component/MapView"
import { Team } from "../component/team/Team";
// import Player from "./component/Player"
import { BottomBar } from "../component/viewer/BottomBar";
import { DemoPlayer } from "../component/viewer/DemoPlayer";
import { useEffect, useRef, useState } from "react";
import { TickData } from "../lib/viewer/types/TickData";
import { useLocation, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Player } from "../lib/viewer/types/player_data";

type RoundInfo = {
    round_num: number;
    winner: "t" | "ct";
    loaded?: boolean;
    had_timeout: boolean;
    ct_wins_during_round: number;
    t_wins_during_round: number;
    team1: string;
    team2: string;
};

type SeriesGame = {
    id: string;
    map_name: string;
};

const Viewer = () => {
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get("demo_id");
    const map = searchParams.get("map");
    const round = searchParams.get("round");

    useEffect(() => {
        const fetchNewGame = async () => {
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/demo/${demoId}/round/${round}`
                );
                const data = await res.json();

                if (data.data) {
                    roundCache.current[Number(round)] = data.data;
                    setTickData(data.data);
                }

                if (data.rounds) {
                    setRoundData(data.rounds);
                }

                if (data.series_demos) {
                    const other_demos = data.series_demos.map((demo: any) => ({
                        id: demo.id,
                        map_name: demo.map_name,
                    }));
                    setSeriesDemos(other_demos);
                }
            } catch (err) {
                console.error("Failed to fetch demo data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNewGame();
    }, [demoId]);

    const navigate = useNavigate();

    const [tickData, setTickData] = useState<TickData[]>([]);
    const [roundData, setRoundData] = useState<RoundInfo[]>([]);
    const [selectedRound, setSelectedRound] = useState<number>(
        round ? parseInt(round) : 1
    );
    const [isPlaying, setIsPlaying] = useState(true);

    const speedValues = [0.5, 1, 1.5, 2, 4];
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

    const [currentTickIndex, setCurrentTickIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const roundCache = useRef<Record<number, TickData[]>>({});

    const [seriesDemos, setSeriesDemos] = useState<SeriesGame[]>([]);

    useEffect(() => {
        const fetchRounds = async () => {
            if (roundCache.current[selectedRound]) {
                navigate(
                    `/viewer?demo_id=${demoId}&map=${map}&round=${selectedRound}`
                );
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
                    // const transformedList: TickData[] = data.data.map(
                    //     (tick: any) => ({
                    //         ...tick,
                    //         players: tick.players.map((player: any) => ({
                    //             ...player,
                    //             side: player.side === "ct",
                    //         })),
                    //     })
                    // );
                    roundCache.current[selectedRound] = data.data;
                    setTickData(data.data);
                    navigate(
                        `/viewer?demo_id=${demoId}&map=${map}&round=${selectedRound}`
                    );
                }
                if (data.rounds) {
                    console.log(data.rounds);
                    setRoundData((prev) => {
                        const prevMap = Object.fromEntries(
                            prev.map((r) => [r.round_num, r])
                        );

                        const updated = data.rounds.map((r: RoundInfo) => {
                            const existing = prevMap[r.round_num];
                            const isSelected = r.round_num === selectedRound;
                            return {
                                ...r,
                                loaded: isSelected || existing?.loaded || false,
                            };
                        });

                        return updated;
                    });
                }
                if (data.series_demos) {
                    console.log(data.series_demos);
                    const other_demos = data.series_demos.map((demo: any) => ({
                        id: demo.id,
                        map_name: demo.map_name,
                    }));
                    setSeriesDemos(other_demos);
                }
            } catch (err) {
                console.error("Error fetching round data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRounds();
        console.log(roundCache);
    }, [selectedRound]);

    useEffect(() => {
        if (tickData.length == 0) return;

        if (currentTickIndex >= tickData.length) {
            setSelectedRound(selectedRound + 1);
            setCurrentTickIndex(0);
        }
    }, [currentTickIndex]);

    const sliderChangeTick = (tick: number) => {
        setCurrentTickIndex(tick);
    };

    const togglePlay = () => {
        if (!isPlaying) {
            setCurrentTickIndex((prev) => prev + 1);
        }
        setIsPlaying((prev) => !prev);
    };

    const changeSpeed = () => {
        if (playbackSpeed === speedValues.length - 1) {
            setPlaybackSpeed(0);
        } else {
            setPlaybackSpeed((prev) => prev + 1);
        }
    };

    const handleSwitchGame = (game: SeriesGame) => {
        setCurrentTickIndex(0);
        setIsPlaying(true);
        navigate(`/viewer?demo_id=${game.id}&map=${game.map_name}&round=1`);
    };

    useEffect(() => {
        console.log("t", tickData[currentTickIndex]?.players);
    }, [tickData]);

    return (
        <div className="w-full h-screen pt-12 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/4 overflow-y-auto p-2">
                    {loading || !tickData[currentTickIndex]?.players ? (
                        <div>Loading...</div>
                    ) : (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => p.side
                                ),
                            ]}
                            score={
                                roundData[selectedRound - 1]
                                    .ct_wins_during_round
                            }
                        />
                    )}
                </div>

                <div className="w-2/4 aspect-square flex items-center justify-center p-2 overflow-hidden">
                    <DemoPlayer
                        currentTick={tickData[currentTickIndex]}
                        previousTick={
                            currentTickIndex === 0
                                ? undefined
                                : tickData[currentTickIndex - 1]
                        }
                        isPlaying={isPlaying}
                        speed={speedValues[playbackSpeed]}
                        onAdvanceTick={() =>
                            setCurrentTickIndex((prev) => prev + 1)
                        }
                        map={map!}
                    />
                </div>

                {/* Right Team */}
                <div className="w-1/4 relative overflow-y-auto p-2">
                    <div className="absolute top-2 right-2 p-2 flex flex-row gap-2">
                        {seriesDemos.map((game) => (
                            <img
                                key={game.id}
                                src={`map_icons/${game.map_name}.png`}
                                alt={game.map_name}
                                onClick={() => {
                                    handleSwitchGame(game);
                                }}
                                className="w-12 h-12 object-cover cursor-pointer rounded"
                            />
                        ))}
                    </div>
                    {loading || !tickData[currentTickIndex]?.players ? (
                        <div>Loading...</div>
                    ) : (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => !p.side
                                ),
                            ]}
                            score={
                                roundData[selectedRound - 1].t_wins_during_round
                            }
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
                    speed={speedValues[playbackSpeed]}
                    changeSpeed={changeSpeed}
                    // onTickChange={setCurrentTickIndex}
                    onTickChange={sliderChangeTick}
                    togglePlay={togglePlay}
                    setSelectedRound={setSelectedRound}
                />
            </div>
        </div>
    );
};

export default Viewer;
