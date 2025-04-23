export type MapInfo = {
    name: string;
    imagePath: string;
    X_MIN: number;
    X_MAX: number;
    Y_MIN: number;
    Y_MAX: number;
};
// inferno
// const X_MIN = -1750,
//     X_MAX = 2625;
// const Y_MIN = -900,
//     Y_MAX = 3700;

// dust
// const X_MIN = -2300,
//     X_MAX = 1950;
// const Y_MIN = -1250,
//     Y_MAX = 3100;

// anubis
// const X_MIN = -2050,
//     X_MAX = 1910;
// const Y_MIN = -1820,
//     Y_MAX = 3250;
const mapData: Record<string, MapInfo> = {
    de_inferno: {
        name: "de_inferno",
        imagePath: "/maps/de_inferno.png",
        X_MIN: -1750,
        X_MAX: 2625,
        Y_MIN: -900,
        Y_MAX: 3700,
    },
    de_mirage: {
        name: "de_mirage",
        imagePath: "/maps/de_mirage.png",
        X_MIN: -2000,
        X_MAX: 2000,
        Y_MIN: -2000,
        Y_MAX: 2000,
    },
    de_dust2: {
        name: "de_dust2",
        imagePath: "/maps/de_dust2.png",
        X_MIN: -2300,
        X_MAX: 1950,
        Y_MIN: -1250,
        Y_MAX: 3100,
    },
    de_anubis: {
        name: "de_anubis",
        imagePath: "/maps/de_anubis.png",
        X_MIN: -2050,
        X_MAX: 1910,
        Y_MIN: -1820,
        Y_MAX: 3250,
    },
};

export function getMapInfo(mapName: string): MapInfo {
    return mapData[mapName];
}
