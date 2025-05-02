export enum GrenadeType {
    Flashbang = "CFlashbangProjectile",
    Smoke = "CSmokeGrenadeProjectile",
    HE = "CHEGrenadeProjectile",
    Shot = "shot",
}

export function getGrenadeNameFromType(type: number): GrenadeType | undefined {
    const map: Record<number, GrenadeType> = {
        4: GrenadeType.Flashbang,
        1: GrenadeType.HE,
        2: GrenadeType.Smoke,
        3: GrenadeType.Shot,
    };

    return map[type];
}

export type InAirGrenade = {
    X: number;
    Y: number;
    entity_id: number;
    grenade_type: number;
};
