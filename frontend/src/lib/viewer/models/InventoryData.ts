const inventoryData: Record<number, string> = {
    1: "M9 Bayonet",
    2: "Butterfly Knife",
    3: "Karambit",
    27: "Stiletto Knife",
    28: "Nomad Knife",

    4: "USP-S",
    5: "P2000",
    6: "Glock-18",
    7: "P250",
    8: "Dual Berettas",
    9: "Five-SeveN",
    10: "Tec-9",
    11: "Desert Eagle",

    12: "MAC-10",
    13: "MP9",

    14: "AK-47",
    15: "Galil AR",
    16: "M4A1-S",
    17: "M4A4",
    18: "FAMAS",
    19: "AWP",
    20: "SSG 08",

    21: "High Explosive Grenade",
    22: "Incendiary Grenade",
    23: "Flashbang",
    24: "Molotov",
    25: "Smoke Grenade",

    26: "C4 Explosive",
};

export function getInventoryItemName(itemId: number): string | undefined {
    return inventoryData[itemId];
}
