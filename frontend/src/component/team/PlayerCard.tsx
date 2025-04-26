import { useEffect, useRef, useState } from "react";
import { Player } from "../../lib/viewer/types/player_data";

// import ak from "../../assets/AK.svg"; // adjust path as needed

type PlayerProps = {
    p?: Player;
    loading?: boolean;
};

export function PlayerCard({ p, loading }: PlayerProps) {
    if (loading || !p) {
        return <div></div>;
    }

    const bgColor = p.side === "ct" ? "bg-blue-500" : "bg-orange-500";
    const healthFill = `${p.health}%`;

    return (
        <div className="relative w-96 m-2 border rounded text-gray-200 shadow overflow-hidden">
            {/* Background: full gray */}
            <div className="absolute inset-0 bg-gray-600" />
            {/* Health fill */}
            {p.health > 0 && (
                <div
                    className={`absolute inset-y-0 left-0 ${bgColor}`}
                    style={{ width: healthFill }}
                />
            )}

            {/* Content */}
            <div
                className="relative p-2 z-10"
                onClick={() => {
                    console.log("here?");
                }}
            >
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <div className="flex items-center font-bold">
                            {p.name}
                            {p.health > 0 && p.bomb && (
                                <span className="ml-2">💣</span>
                            )}
                        </div>
                        <div className="text-sm">
                            {p.health > 0
                                ? p.primary != null
                                    ? p.primary
                                    : p.secondary
                                : null}
                        </div>
                    </div>

                    <div className="text-sm text-right">
                        {p.health > 0 &&
                            p.grenades.length > 0 &&
                            p.grenades.join(", ")}
                    </div>
                </div>
            </div>
        </div>
    );
}
