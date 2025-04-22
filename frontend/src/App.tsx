// import { useState } from 'react'
import "./App.css";
// import MapView from "../component/MapView"
import { Team } from "./component/team/Team";
// import Player from "./component/Player"
import { BottomBar } from "./component/BottomBar";
import { DemoPlayer } from "./component/viewer/DemoPlayer";
import { useEffect, useRef, useState } from "react";
import { TickData } from "./lib/viewer/types/tick_data";

type RoundInfo = {
  round_num: number;
  winner: "t" | "ct";
  loaded?: boolean;
};

const App = () => {
  const [tickData, setTickData] = useState<TickData[]>([]);
  const [roundData, setRoundData] = useState<RoundInfo[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  //   const [loading, setLoading] = useState(false);

  const roundCache = useRef<Record<number, TickData[]>>({});

  useEffect(() => {
    const fetchRounds = async () => {
      if (roundCache.current[selectedRound]) {
        setTickData(roundCache.current[selectedRound]);
        // setLoading(false);
        return;
      }

      //   setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/round/${selectedRound}`);
        const data = await res.json();
        if (data.data) {
          console.log(data.data);
          setTickData(data.data);
        }
        if (data.rounds) {
          setRoundData((prev) => {
            if (prev.length === 0 && data.rounds) {
              return data.rounds.map((r: RoundInfo) =>
                r.round_num === selectedRound ? { ...r, loaded: true } : r
              );
            }

            return prev.map((r) =>
              r.round_num === selectedRound ? { ...r, loaded: true } : r
            );
          });
        }
      } catch (err) {
        console.error("Error fetching round data:", err);
      } //finally {
      //     setLoading(false);
      //   }
    };

    fetchRounds();
  }, [selectedRound]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTickChange = (tickIndex: number) => {
    setCurrentIndex(tickIndex);
  };

  const nextRound = () => {
    setCurrentIndex(0);
    setSelectedRound((prevRound) => prevRound + 1);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-12 text-white flex items-center justify-center border-b border-gray-500">
        Top Bar
      </div>

      {/* Middle Section (fills remaining height) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Team */}
        <div className="w-1/4 overflow-y-auto p-2">
          {tickData.length > 0 && (
            <Team
              key={`t-${currentIndex}`}
              players={[
                ...tickData[currentIndex].players.filter(
                  (p) => p.side === "ct"
                ),
              ]}
            />
          )}
        </div>

        {/* Viewer */}
        <div className="w-2/4 aspect-square bg-gray-800 flex items-center justify-center p-2 overflow-hidden">
          <DemoPlayer
            ticks={tickData}
            isPlaying={isPlaying}
            currentIndex={currentIndex}
            onTickChange={handleTickChange}
            onNextRound={nextRound}
          />
        </div>

        {/* Right Team */}
        <div className="w-1/4 overflow-y-auto p-2">
          {tickData.length === 0 ? (
            <div>Loading...</div>
          ) : (
            <Team
              key={`t-${currentIndex}`}
              players={[
                ...tickData[currentIndex].players.filter((p) => p.side === "t"),
              ]}
            />
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-28 border-t border-gray-500 text-white w-full">
        <BottomBar
          rounds={roundData}
          onSelectedRound={setSelectedRound}
          tickData={tickData}
          onTickChange={handleTickChange}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          currentTick={currentIndex}
        />
      </div>
    </div>
  );
};

export default App;
