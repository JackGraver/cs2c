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
        <div className="space-y-1 text-sm w-80 mt-2 rounded-md p-2 border border-gray-100">
            {/* Top Row */}
            <div className="flex justify-between">
                <span className="text-lg leading-none">{player.name}</span>
                <span>{player.armor}</span>
                {player.side ? (
                    <div> {player.has_defuser ? "Defuser" : "Loser"} </div>
                ) : (
                    <div> {player.inventory.includes(26) ? "Bomb" : "No"}</div>
                )}
            </div>

            {/* Middle Row */}
            <div className="flex justify-between">
                <span>{player.inventory[-1]}</span>
                <span>GRENADES</span>
            </div>

            {/* Bottom Row: Health Bar */}
            <div className="flex items-center">
                <HealthBar health={player.health} fillColor={bgColor} />
            </div>
        </div>

        // <div className="relative w-96 m-2 border rounded text-gray-200 shadow overflow-hidden">
        //     {/* Background: full gray */}
        //     <div className="absolute inset-0 bg-gray-600" />
        //     {/* Health fill */}
        //     {p.health > 0 && (
        //         <div
        //             className={`absolute inset-y-0 left-0 ${bgColor}`}
        //             style={{ width: healthFill }}
        //         />
        //     )}

        //     {/* Content */}
        //     <div
        //         className="relative p-2 z-10"
        //         onClick={() => {
        //             console.log("here?");
        //         }}
        //     >
        //         <div className="flex justify-between items-start">
        //             <div className="flex flex-col">
        //                 <div className="flex items-center font-bold">
        //                     {p.name}
        //                     {/* {p.health > 0 && p.bomb && (
        //                         <span className="ml-2">💣</span>
        //                     )} */}
        //                 </div>
        //                 <div className="text-sm">
        //                     {/* {p.health > 0
        //                         ? p.primary != null
        //                             ? p.primary
        //                             : p.secondary
        //                         : null} */}
        //                 </div>
        //             </div>

        //             <div className="text-sm text-right">
        //                 {p.health > 0 &&
        //                     p.inventory.length > 0 &&
        //                     p.inventory
        //                         .map((id) => getInventoryItemName(id))
        //                         .filter(Boolean)
        //                         .join(", ")}
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
}
