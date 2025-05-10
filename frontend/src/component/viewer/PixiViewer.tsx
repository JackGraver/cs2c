import { useEffect, useRef, useState } from "react";
import { MapViewer } from "../../lib/viewer/MapViewer";
import { TickData } from "../../lib/viewer/types/TickData";

type PixiViewerProps = {
    currentTick: TickData;
    previousTick: TickData | undefined;
    speed: number;
    mapI: string;
};

export function PixiViewer({
    currentTick,
    previousTick,
    speed,
    mapI,
}: PixiViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapViewerRef = useRef<MapViewer | null>(null);

    const [map, setMap] = useState<string>(mapI);

    useEffect(() => {
        const initializeMapViewer = async () => {
            // Cleanup before re-creating
            if (mapViewerRef.current) {
                mapViewerRef.current.destroy();
                mapViewerRef.current = null;
            }

            if (!containerRef.current) return;

            setMap(mapI);
            mapViewerRef.current = new MapViewer(containerRef.current, mapI);
            await mapViewerRef.current.init();
        };

        initializeMapViewer();

        // Cleanup function (if needed)
        return () => {
            mapViewerRef.current?.destroy();
            mapViewerRef.current = null;
        };
    }, [mapI]);

    useEffect(() => {
        if (!mapViewerRef.current || !currentTick) {
            return;
        }

        if (!mapViewerRef.current.hasPlayers()) {
            mapViewerRef.current.createPlayers(currentTick);
            return;
        } else if (!previousTick && mapViewerRef.current.hasPlayers()) {
            mapViewerRef.current.reDrawPlayers();
            return;
        }

        // Interpolated animation from previousTick to currentTick
        let animationFrame: number;
        const startTime = performance.now();
        const duration = 300 / speed; // ms

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1); // Clamp between 0 and 1

            mapViewerRef.current?.renderInterpolatedFrame(
                currentTick,
                previousTick!,
                t
            );

            if (t < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [currentTick, previousTick]);

    const handleDisplayLowerMap = () => {
        console.log(map);
        if (map === "de_nuke") {
            console.log("switch nuke lower");
            setMap("de_nuke_lower");
            mapViewerRef.current?.updateMap("de_nuke_lower");
        } else if (map === "de_nuke_lower") {
            console.log("switch nuke upper");
            setMap("de_nuke");
            mapViewerRef.current?.updateMap("de_nuke");
        } else if (map === "de_train") {
            console.log("switch train inner/outer");
        }
    };

    return (
        <div
            ref={containerRef}
            onClick={handleDisplayLowerMap}
            className="w-full h-full"
        />
    );
}
