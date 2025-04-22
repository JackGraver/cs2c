import { InAirGrenade } from "./in_air_grenade";
import { Player } from "./player_data";
import { SmokeMolly } from "./smoke_molly_data";

export type TickData = {
  tick: number;

  time: string;

  players: Player[];

  activeSmokes: SmokeMolly[];

  activeMolly: SmokeMolly[];

  activeGrenades: InAirGrenade[];

  shots: {
    id: string;
    x: number;
    y: number;
    weapon: string;
  }[];
};
