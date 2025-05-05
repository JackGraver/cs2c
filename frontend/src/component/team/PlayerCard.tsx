import { act, useEffect, useRef, useState } from "react";
import { Player } from "../../lib/viewer/types/player_data";
import { getInventoryItemName } from "../../lib/viewer/models/InventoryData";
import HealthBar from "./HealthBar";

// import ak from "../../assets/AK.svg"; // adjust path as needed

type PlayerProps = {
    player?: Player;
    loading?: boolean;
};

/*
Everything shown in LIVE Huds

Player name
Kills/Deaths/(adr/damage)
Money
Weapon
Bomb
Grenades
Armor
Health
    - indicators (red for low)
    - took damage (lagging behind red)

    
My display
Top row
    - Name
    - Money /
    - Score & other /
    - Armor
    - Bomb/Defuser

Middle 
    - Weapon
    - Grenades
Bottom row  
    - health

*/
export function PlayerCard({ player, loading }: PlayerProps) {
    if (loading || !player) {
        return <div></div>;
    }

    const bgColor = player.side ? "bg-blue-500" : "bg-orange-500";
    const healthFill = `${player.health}%`;

    return (
        <div className="relative space-y-1 text-sm w-80 mt-2 rounded-md p-2 overflow-hidden">
            {/* Health bar background */}
            <div
                className={`absolute top-0 left-0 h-full ${bgColor} z-0`}
                style={{ width: healthFill }}
            ></div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex justify-between">
                    <span className="text-lg leading-none">{player.name}</span>
                    <span>{player.armor}</span>
                    {player.side ? (
                        <div>{player.has_defuser ? "Defuser" : "Loser"}</div>
                    ) : (
                        <div>
                            {player.inventory.includes(26) ? "Bomb" : "No"}
                        </div>
                    )}
                </div>

                <div className="flex justify-between">
                    <span>{player.inventory[-1]}</span>
                    <span>GRENADES</span>
                </div>
            </div>
        </div>
    );
}
