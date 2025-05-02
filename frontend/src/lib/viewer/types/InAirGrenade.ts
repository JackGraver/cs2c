export enum GrenadeType {
    Flashbang = "CFlashbangProjectile",
    Smoke = "CSmokeGrenadeProjectile",
    HE = "CHEGrenadeProjectile",
    Shot = "shot",
}

export type InAirGrenade = {
    X: number;
    Y: number;
    entity_id: number;
    grenade_type: GrenadeType;
};
