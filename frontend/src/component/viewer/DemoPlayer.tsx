import { useEffect, useState } from "react";
import { PixiViewer } from "./PixiViewer";
import { TickData } from "../../lib/viewer/types/tick_data";

type DemoPlayerProps = {
    currentTick: TickData;
    previousTick: TickData | undefined;
    isPlaying: boolean;
    onAdvanceTick: () => void;
    map: string;
};

export function DemoPlayer({
    currentTick,
    isPlaying,
    previousTick,
    onAdvanceTick,
    map,
}: DemoPlayerProps) {
    useEffect(() => {
        if (!isPlaying) return;

        const id = setInterval(() => {
            onAdvanceTick();
        }, 600);

        return () => clearInterval(id);
    }, [isPlaying, onAdvanceTick]);

    return (
        <div className="relative w-full h-full">
            {/* Time display */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm shadow">
                {currentTick ? currentTick.time : "0.00"}
            </div>

            {/* Pixi viewer */}
            <PixiViewer
                currentTick={currentTick}
                previousTick={previousTick}
                map={map}
            />
        </div>
    );
}
