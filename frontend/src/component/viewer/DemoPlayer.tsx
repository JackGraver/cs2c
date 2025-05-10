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
                tick: currentTick.tick,
            }));

            setDisplayedKills((prevKills) => [...prevKills, ...newKills]);
        }
    };

    /**
     * Cut off oldest kills if having to display more than 5
     */
    useEffect(() => {
        if (displayedKills.length > 5) {
            displayedKills.shift();
        }
    }, [displayedKills]);

    /**
     * Update current kills (for KillFeed)
     */
    useEffect(() => {
        if (currentTick && currentTick.tick !== undefined) {
            setDisplayedKills((prevKills) =>
                prevKills.filter((kill) => currentTick.tick - kill.tick < 320)
            );
        }
    }, [currentTick]);

    /**
     * Handle demo playing (for PixiViewer)
     */
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
        <>
            {currentTick && (
                <div className="relative pt-8 w-full h-full">
                    <KillFeed kills={displayedKills}></KillFeed>
                    <PixiViewer
                        currentTick={currentTick}
                        speed={speed}
                        previousTick={previousTick}
                        mapI={map}
                    />
                </div>
            )}
        </>
    );
}
