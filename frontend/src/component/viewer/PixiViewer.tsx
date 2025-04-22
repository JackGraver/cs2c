import { useEffect, useRef, useState } from "react";
import { MapViewer } from "../../lib/viewer/MapViewer";
import { TickData } from "../../lib/viewer/types/tick_data";

type PixiViewerProps = {
  tickData: TickData | undefined;
};

export function PixiViewer({ tickData }: PixiViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapViewerRef = useRef<MapViewer | null>(null);

  useEffect(() => {
    const initializeMapViewer = async () => {
      if (!containerRef.current || mapViewerRef.current) return;

      // Create your MapViewer instance once
      mapViewerRef.current = new MapViewer(containerRef.current);

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
  }, []); // Empty dependency array to run once when component mounts

  useEffect(() => {
    if (!tickData || !mapViewerRef.current) return;

    // Each time tickData updates, draw the new frame
    if (!mapViewerRef.current.hasPlayers()) {
      mapViewerRef.current.createPlayers(tickData);
    }
    mapViewerRef.current.drawFrame(tickData);
  }, [tickData]);

  return (
    <div
      ref={containerRef}
      style={{ width: "1024px", height: "768px", position: "relative" }}
    />
  );
}
