enum GrenadeType {
    Flashbang = "CFlashBangProjetile",
    Smoke = "CSmokeGrenadeProjectile",
}

export type InAirGrenade = {
    X: number;
    Y: number;
    entity_id: number;
    type: GrenadeType;
    thrower: string;
};
