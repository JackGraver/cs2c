import { Team } from "../component/team/Team";
import { BottomBar } from "../component/viewer/BottomBar";
import { DemoPlayer } from "../component/viewer/DemoPlayer";
import { useEffect, useRef, useState } from "react";
import { TickData } from "../lib/viewer/types/TickData";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../component/viewer/TopBar";
import { SeriesGame } from "../lib/viewer/types/SeriesGame";
import { KillFeed } from "../component/killfeed/KillFeed";

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

const Viewer = () => {
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get("demo_id");
    const map = searchParams.get("map");
    const round = searchParams.get("round");

    useEffect(() => {
        const fetchNewGame = async () => {
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/v2/demo/${demoId}/round/${round}`
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
                    `http://127.0.0.1:8000/v2/demo/${demoId}/round/${selectedRound}`
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
        if (game.id === demoId) {
            return;
        }
        setCurrentTickIndex(0);
        setSelectedRound(1);
        setIsPlaying(true);
        navigate(`/viewer?demo_id=${game.id}&map=${game.map_name}&round=1`);
    };

    return (
        <div className="w-full h-screen flex flex-col text-white overflow-hidden">
            {/* TopBar (fixed height) */}
            <div className="w-full border-b border-gray-500 z-10">
                <TopBar
                    currentTick={tickData[currentTickIndex]}
                    series={seriesDemos}
                    handleSwitchGame={handleSwitchGame}
                    score_ct={
                        roundData[selectedRound - 1]?.ct_wins_during_round
                    }
                    score_t={roundData[selectedRound - 1]?.t_wins_during_round}
                />
            </div>

            {/* Middle section: fills available space */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Team */}
                <div className="w-1/4 overflow-auto p-2">
                    {loading || !tickData[currentTickIndex]?.players ? (
                        <div>Loading...</div>
                    ) : (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => p.is_ct
                                ),
                            ]}
                        />
                    )}
                </div>

                {/* Demo viewer */}
                <div className="w-2/4 p-2 flex items-center justify-center">
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
                <div className="w-1/4 overflow-auto p-2">
                    {loading || !tickData[currentTickIndex]?.players ? (
                        <div>Loading...</div>
                    ) : (
                        <Team
                            key={`t-${currentTickIndex}`}
                            players={[
                                ...tickData[currentTickIndex].players.filter(
                                    (p) => !p.is_ct
                                ),
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* BottomBar (fixed height) */}
            <div className="h-28 border-t border-gray-500 w-full">
                <BottomBar
                    rounds={roundData}
                    currentTickIndex={currentTickIndex}
                    totalTicks={tickData.length}
                    isPlaying={isPlaying}
                    speed={speedValues[playbackSpeed]}
                    changeSpeed={changeSpeed}
                    onTickChange={sliderChangeTick}
                    togglePlay={togglePlay}
                    setSelectedRound={setSelectedRound}
                />
            </div>
        </div>
    );
};

export default Viewer;
