import React from "react";
import { ReactComponent as PlayerIcon } from "../../assets/PlayerIcon.svg"; // Import SVG as a React component

interface PlayerIconProps {
  yaw: number;
}

const PlayerIconComponent: React.FC<PlayerIconProps> = ({ yaw }) => {
  return (
    <PlayerIcon
      style={{
        transform: `rotate(${yaw}deg)`,
        transformOrigin: "50% 50%", // Ensures rotation is centered around the circle
      }}
    />
  );
};

export default PlayerIconComponent;
