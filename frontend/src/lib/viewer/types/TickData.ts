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

    mollys: SmokeMolly[];

    in_air_grenades: InAirGrenade[];

    shots: {
        tick: number;
        shot_id: number;
        X: number;
        Y: number;
        yaw: number;
        weapon: number;
    }[];

    kills: Kill[];

    bomb_plant: BombPlant[];
};
