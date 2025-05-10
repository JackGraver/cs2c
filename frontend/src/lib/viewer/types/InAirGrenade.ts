export enum GrenadeType {
    Flashbang = "CFlashbangProjectile",
    Smoke = "CSmokeGrenadeProjectile",
    HE = "CHEGrenadeProjectile",
    Molly = "CMolotovProjectile",
    Shot = "shot",
}

export function getGrenadeNameFromType(type: number): GrenadeType | undefined {
    const map: Record<number, GrenadeType> = {
        1: GrenadeType.Flashbang,
        2: GrenadeType.Smoke,
        3: GrenadeType.Molly,
        4: GrenadeType.HE,
        5: GrenadeType.Shot,
    };

    return map[type];
}

export const textureMap: Record<GrenadeType, string> = {
    [GrenadeType.HE]: "he",
    [GrenadeType.Flashbang]: "flash",
    [GrenadeType.Smoke]: "smoke",
    [GrenadeType.Molly]: "molly",
    [GrenadeType.Shot]: "shot",
};

export type InAirGrenade = {
    tick: number;
    X: number;
    Y: number;
    entity_id: number;
    type: number;
};
