import { BombPlant } from "./BombPlant";
import { InAirGrenade } from "./InAirGrenade";
import { Kill } from "./kill";
import { Player } from "./player_data";
import { SmokeMolly } from "./smoke_molly_data";

export type TickData = {
    tick: number;

    logical_time: string;

    players: Player[];

    smokes: SmokeMolly[];

    mollies: SmokeMolly[];

    in_air_grenades: InAirGrenade[];

    shots: {
        X: number;
        Y: number;
        Z: number;
        tick: number;
        shot_id: number;
        yaw: number;
        weapon: number;
    }[];

    kills: Kill[];

    bomb_plant: BombPlant[];
};
