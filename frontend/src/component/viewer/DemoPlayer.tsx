import { useEffect, useState } from "react";
import { PixiViewer } from "./PixiViewer";
import { TickData } from "../../lib/viewer/types/tick_data";

type DemoPlayerProps = {
  ticks: TickData[];
  isPlaying: boolean;
  currentIndex: number;
  onTickChange: (tickIndex: number) => void;
  onNextRound: () => void;
};

export function DemoPlayer({
  ticks,
  isPlaying,
  currentIndex,
  onTickChange,
  onNextRound,
}: DemoPlayerProps) {
  const [tickIndex, setTickIndex] = useState(currentIndex);

  // Sync internal tick index when parent changes currentIndex
  useEffect(() => {
    console.log("DP UE 1");
    if (currentIndex !== tickIndex) {
      setTickIndex(currentIndex);
    }
  }, [currentIndex]);

  //   // Only notify parent if user-initiated change (optional, if needed)
  //   useEffect(() => {
  //     console.log("DP UE 2");
  //     if (tickIndex !== currentIndex) {
  //       onTickChange?.(tickIndex);
  //     }
  //   }, [tickIndex, currentIndex]); // Include both in deps

  // Auto-increment if playing
  useEffect(() => {
    if (!isPlaying) return;

    const id = window.setInterval(() => {
      setTickIndex((prev) => {
        if (prev < ticks.length - 1) {
          return prev + 1;
        } else {
          if (ticks.length != 0) {
            onNextRound();
          }
          return prev;
        }
      });
    }, 400);

    return () => clearInterval(id);
  }, [isPlaying, ticks.length]);

  const currentTick = ticks[tickIndex];
  const time = currentTick ? currentTick.time : "0.00";

  return (
    <div className="relative w-full h-full">
      {/* Time display */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm shadow">
        {time}
      </div>

      {/* Pixi viewer */}
      <PixiViewer tickData={currentTick} />
    </div>
  );
}
