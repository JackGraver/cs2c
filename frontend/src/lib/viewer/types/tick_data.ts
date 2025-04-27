import { InAirGrenade } from "./in_air_grenade";
import { Kill } from "./kill";
import { Player } from "./player_data";
import { SmokeMolly } from "./smoke_molly_data";

export type TickData = {
    tick: number;

    bomb_plant: {
        tick: number;
        user_X: number;
        user_Y: number;
    }[];

    time: string;

    players: Player[];

    activeSmokes: SmokeMolly[];

    activeMolly: SmokeMolly[];

    activeGrenades: InAirGrenade[];

    shots: {
        tick: number;
        shot_id: number;
        user_X: number;
        user_Y: number;
        user_yaw: number;
        weapon: string;
    }[];

    kills: Kill[];

    // kills: {
    //     tick: number;
    //     assistedflash: boolean;
    //     assister_name: string;
    //     assister_side: string;
    //     attacker_name: string;
    //     attacker_side: string;
    //     attackerblind: boolean;
    //     attackerinair: boolean;
    //     headshot: boolean;
    //     noscope: boolean;
    //     penetrated: boolean;
    //     thrusmoke: boolean;
    //     weapon: string;
    //     user_name: string;
    //     user_side: string;
    // }[];
};
