import { useEffect, useState } from "react";
import { PixiViewer } from "./PixiViewer";
import { TickData } from "../../lib/viewer/types/TickData";
import { KillFeed } from "../killfeed/KillFeed";
import { Kill } from "../../lib/viewer/types/kill";

type DemoPlayerProps = {
    currentTick: TickData;
    previousTick: TickData | undefined;
    isPlaying: boolean;
    speed: number;
    onAdvanceTick: () => void;
    map: string;
};

export function DemoPlayer({
    currentTick,
    isPlaying,
    previousTick,
    speed,
    onAdvanceTick,
    map,
}: DemoPlayerProps) {
    const [displayedKills, setDisplayedKills] = useState<Kill[]>([]);

    const processKills = (tickKills: Kill[]) => {
        if (tickKills.length > 0) {
            const newKills = tickKills.map((kill) => ({
                ...kill,
                timestamp: Date.now(),
            }));

            setDisplayedKills((prevKills) => [...prevKills, ...newKills]);
        }
    };

    useEffect(() => {
        if (displayedKills.length > 5) {
            displayedKills.shift();
        }
    }, [displayedKills]);

    useEffect(() => {
        if (
            currentTick &&
            currentTick.tick !== undefined &&
            displayedKills.length > 0
        ) {
            setDisplayedKills((prevKills) =>
                prevKills.filter((kill) => currentTick.tick - kill.tick < 768)
            );
        }
    }, [currentTick]);

    useEffect(() => {
        if (!isPlaying) return;

        if (currentTick && currentTick.kills.length !== 0) {
            processKills(currentTick.kills);
        }

        const id = setInterval(() => {
            onAdvanceTick();
        }, 300 / speed);

        return () => clearInterval(id);
    }, [isPlaying, onAdvanceTick]);

    return (
        <div className="relative w-full h-full">
            {/* Time display */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm shadow">
                {currentTick ? currentTick.time : "0.00"}
            </div>

            <KillFeed kills={displayedKills}></KillFeed>

            {/* Pixi viewer */}
            <PixiViewer
                currentTick={currentTick}
                speed={speed}
                previousTick={previousTick}
                mapI={map}
            />
        </div>
    );
}
