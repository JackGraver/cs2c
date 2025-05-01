import { useEffect, useRef, useState } from "react";

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

type RoundScrollerProps = {
    rounds: RoundInfo[];
    handleRoundClick: (round_num: number) => void;
};

export default function RoundScroller({
    rounds,
    handleRoundClick,
}: RoundScrollerProps) {
    console.log("RS", rounds);
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleStart, setVisibleStart] = useState(0);
    const [buttonsPerPage, setButtonsPerPage] = useState(6); // fallback default

    useEffect(() => {
        const calculateButtonsPerPage = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const buttonWidth = 64; // estimate or measure your average button width in px
                const buttons = Math.floor(containerWidth / (buttonWidth + 8)); // 8 = gap
                setButtonsPerPage(buttons || 1);
            }
        };

        calculateButtonsPerPage();
        window.addEventListener("resize", calculateButtonsPerPage);
        return () =>
            window.removeEventListener("resize", calculateButtonsPerPage);
    }, []);

    const visibleRounds = rounds.slice(
        visibleStart,
        visibleStart + buttonsPerPage
    );

    const canScrollLeft = visibleStart > 0;
    const canScrollRight = visibleStart + buttonsPerPage < rounds.length;

    const scrollLeft = () => {
        setVisibleStart((prev) => Math.max(prev - buttonsPerPage, 0));
    };

    const scrollRight = () => {
        setVisibleStart((prev) =>
            Math.min(prev + buttonsPerPage, rounds.length - buttonsPerPage)
        );
    };

    return (
        <div
            ref={containerRef}
            className="flex space-x-2 justify-center overflow-hidden transition-transform duration-300 ease-in-out"
        >
            {canScrollLeft && (
                <button
                    onClick={scrollLeft}
                    className="text-white px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                    ←
                </button>
            )}

            <div className="flex space-x-2 overflow-hidden">
                {visibleRounds.map((round, i) => (
                    <button
                        key={round.round_num}
                        onClick={() => handleRoundClick(round.round_num)}
                        className={`px-4 py-2 w-14 text-center rounded whitespace-nowrap
                            ${
                                round.had_timeout
                                    ? "text-white border-t-2 border-green-400"
                                    : ""
                            }
                            ${
                                round.loaded
                                    ? round.winner === "t"
                                        ? "bg-orange-500 hover:bg-orange-600"
                                        : "bg-blue-500 hover:bg-blue-600"
                                    : "bg-gray-500 hover:bg-gray-600"
                            }`}
                    >
                        {round.round_num}
                    </button>
                ))}
            </div>

            {canScrollRight && (
                <button
                    onClick={scrollRight}
                    className="text-white px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                    →
                </button>
            )}
        </div>
    );
}
