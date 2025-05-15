import { Team } from "../component/team/Team";
import { BottomBar } from "../component/viewer/BottomBar";
import { DemoPlayer } from "../component/viewer/DemoPlayer";
import { useEffect, useRef, useState } from "react";
import { TickData } from "../lib/viewer/types/TickData";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../component/viewer/TopBar";
import { SeriesGame } from "../lib/viewer/types/SeriesGame";
import { ErrorModal } from "../component/dialog/AlertModal";
import { RoundData } from "../lib/viewer/types/RoundData";

const Viewer = () => {
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get("demo_id");
    const map = searchParams.get("map");
    const round = searchParams.get("round");

    // useEffect(() => {
    //     const fetchNewGame = async () => {
    //         try {
    //             const res = await fetch(
    //                 `http://127.0.0.1:8000/demo/${demoId}/round/${round}`
    //             );
    //             const data = await res.json();

    //             const fetchStatus = data.status;

    //             if (fetchStatus === 0) {
    //                 if (data.data) {
    //                     console.log(data.data);
    //                     roundCache.current[selectedRound] = data.data;
    //                     setTickData(data.data);
    //                     navigate(
    //                         `/viewer?demo_id=${demoId}&map=${map}&round=${selectedRound}`
    //                     );
    //                 }

    //                 if (data.rounds) {
    //                     setRoundData((prev) => {
    //                         const prevMap = Object.fromEntries(
    //                             prev.map((r) => [r.round_num, r])
    //                         );

    //                         const updated = data.rounds.map((r: RoundInfo) => {
    //                             const existing = prevMap[r.round_num];
    //                             const isSelected =
    //                                 r.round_num === selectedRound;
    //                             return {
    //                                 ...r,
    //                                 loaded:
    //                                     isSelected || existing?.loaded || false,
    //                             };
    //                         });

    //                         return updated;
    //                     });
    //                 }

    //                 if (data.series_demos) {
    //                     const other_demos = data.series_demos.map(
    //                         (demo: any) => ({
    //                             id: demo.id,
    //                             map_name: demo.map_name,
    //                         })
    //                     );
    //                     setSeriesDemos(other_demos);
    //                 }
    //             } else {
    //                 setErrorMessage(data.message);
    //             }
    //         } catch (err) {
    //             console.error("Failed to fetch demo data:", err);
    //         } finally {
    //             console.log("here?");
    //             setLoading(tickData.length === 0);
    //         }
    //     };

    //     fetchNewGame();
    // }, [demoId]);

    const navigate = useNavigate();

    /**
     * ticks
     */
    const [tickData, setTickData] = useState<TickData[]>([]);
    const [roundData, setRoundData] = useState<RoundData[]>([]);
    const [selectedRound, setSelectedRound] = useState<number>(
        round ? parseInt(round) : 1
    );
    const roundCache = useRef<Record<number, TickData[]>>({});

    /**
     * playback
     */
    const [isPlaying, setIsPlaying] = useState(true);
    const speedValues = [0.5, 1, 1.5, 2, 4];
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
    const [currentTickIndex, setCurrentTickIndex] = useState(0);

    /**
     * other
     */
    const [loading, setLoading] = useState(true);

    const [seriesDemos, setSeriesDemos] = useState<SeriesGame[]>([]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch round metadata once
    useEffect(() => {
        if (roundData.length === 0) {
            fetch(`http://127.0.0.1:8080/demo/${demoId}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("round data", data);

                    const rounds: RoundData[] = data.demo_rounds.map(
                        (round: RoundData) => ({
                            ...round,
                            loaded: false,
                        })
                    );

                    setRoundData(rounds);

                    // Cache the first round tick data if provided
                    const initialRound = data.round_data?.round_num;
                    if (initialRound !== undefined) {
                        roundCache.current[initialRound] =
                            data.round_data.ticks;
                    }
                })
                .catch(console.error);
        }
    }, [demoId, roundData]);

    // Fetch tick data whenever selectedRound changes
    useEffect(() => {
        if (selectedRound === null) return;

        // If already cached, just use it
        if (roundCache.current[selectedRound]) {
            setTickData(roundCache.current[selectedRound]);
            setRoundData((prev) =>
                prev.map((round) =>
                    round.round_num === selectedRound
                        ? { ...round, loaded: true }
                        : round
                )
            );
            return;
        }

        // Otherwise, fetch and cache
        fetch(`http://127.0.0.1:8080/demo/${demoId}/round/${selectedRound}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("tdata", data);

                const ticks = data.round_data.ticks;
                setTickData(ticks);
                roundCache.current[selectedRound] = ticks;

                // Set the loaded flag for only the selected round
                setRoundData((prev) =>
                    prev.map((round) =>
                        round.round_num === selectedRound
                            ? { ...round, loaded: true }
                            : round
                    )
                );
            })
            .catch(console.error);
    }, [selectedRound, demoId]);

    useEffect(() => {
        setLoading(tickData.length === 0);
    }, [tickData]);

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
        <>
            {errorMessage ? (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => {
                        navigate(`/`);
                    }}
                />
            ) : (
                <div className="w-full h-screen flex flex-col text-white overflow-hidden">
                    {/* TopBar (fixed height) */}
                    <div className="border-b border-gray-500 z-10">
                        {loading ? (
                            <p className="text-center">LOADING</p>
                        ) : (
                            <TopBar
                                currentTick={tickData[currentTickIndex]}
                                series={seriesDemos}
                                handleSwitchGame={handleSwitchGame}
                                score_ct={
                                    roundData[selectedRound - 1]?.ct_score
                                }
                                score_t={roundData[selectedRound - 1]?.t_score}
                            />
                        )}
                    </div>

                    {/* Middle section (takes up all remaining vertical space) */}
                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-1/4 overflow-auto p-2">
                            {loading ? (
                                <Team
                                    players={undefined}
                                    team_name={undefined}
                                    ct_team={true}
                                />
                            ) : (
                                <Team
                                    key={`t-${currentTickIndex}`}
                                    players={[
                                        ...(tickData[
                                            currentTickIndex
                                        ]?.players?.filter((p) => p.is_ct) ??
                                            []),
                                    ]}
                                    team_name={roundData[0].team_ct}
                                    ct_team={true}
                                />
                            )}
                        </div>

                        <div className="w-2/4 p-2 flex items-center justify-center">
                            {loading ? (
                                <p className="text-center">LOADING</p>
                            ) : (
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
                            )}
                        </div>

                        <div className="w-1/4 overflow-auto p-2">
                            {loading ? (
                                <Team
                                    players={undefined}
                                    team_name={undefined}
                                    ct_team={false}
                                />
                            ) : (
                                <Team
                                    players={[
                                        ...(tickData[
                                            currentTickIndex
                                        ]?.players?.filter((p) => !p.is_ct) ??
                                            []),
                                    ]}
                                    team_name={roundData[0].team_t}
                                    ct_team={false}
                                />
                            )}
                        </div>
                    </div>

                    {/* BottomBar (fixed height) */}
                    <div className="h-28 border-t border-gray-500 w-full">
                        {loading ? (
                            <p className="text-center">LOADING</p>
                        ) : (
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
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Viewer;
