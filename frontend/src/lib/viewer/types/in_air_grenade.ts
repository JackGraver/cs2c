import { InAirGrenadeDot } from "../models/air_grenadedot";

export enum GrenadeType {
    Flashbang = "CFlashbangProjectile",
    Smoke = "CSmokeGrenadeProjectile",
    HE = "CHEGrenadeProjectile",
    Shot = "shot",
}

export type InAirGrenade = {
    display: InAirGrenadeDot;
    X: number;
    Y: number;
    entity_id: number;
    grenade_type: GrenadeType;
    thrower: string;
};
