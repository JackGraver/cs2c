import { useEffect, useRef, useState } from "react";
import { MapViewer } from "../../lib/viewer/MapViewer";
import { TickData } from "../../lib/viewer/types/TickData";

type PixiViewerProps = {
    currentTick: TickData;
    previousTick: TickData | undefined;
    speed: number;
    map: string;
};

export function PixiViewer({
    currentTick,
    previousTick,
    speed,
    map,
}: PixiViewerProps) {
    console.log("pv", map);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapViewerRef = useRef<MapViewer | null>(null);

    useEffect(() => {
        mapViewerRef.current?.updateMap(map);
    }, [map]);

    useEffect(() => {
        const initializeMapViewer = async () => {
            if (!containerRef.current || mapViewerRef.current) return;

            // Create your MapViewer instance once
            mapViewerRef.current = new MapViewer(containerRef.current, map);

            // Wait for init to complete before moving forward
            await mapViewerRef.current.init();
        };

        // Call the async initialization function
        initializeMapViewer();

        // Cleanup function (if needed)
        return () => {
            if (mapViewerRef.current) {
                mapViewerRef.current.destroy();
                mapViewerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapViewerRef.current || !currentTick) return;

        if (!previousTick && !mapViewerRef.current.hasPlayers()) {
            mapViewerRef.current.createPlayers(currentTick);
            return;
            // new round or ???
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

    return (
        <div
            ref={containerRef}
            style={{ width: "1024px", height: "768px", position: "relative" }}
        />
    );
}
