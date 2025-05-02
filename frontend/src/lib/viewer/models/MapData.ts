export type MapInfo = {
    name: string;
    imagePath: string;
    X_MIN: number;
    X_MAX: number;
    Y_MIN: number;
    Y_MAX: number;
};
const mapData: Record<string, MapInfo> = {
    de_inferno: {
        name: "de_inferno",
        imagePath: "/maps/de_inferno.png",
        X_MIN: -1780,
        X_MAX: 2700,
        Y_MIN: -760,
        Y_MAX: 3593,
    }, // X 2260 -1730 Y 3593 760
    de_mirage: {
        name: "de_mirage",
        imagePath: "/maps/de_mirage.png",
        X_MIN: -2655,
        X_MAX: 1455,
        Y_MIN: -2603,
        Y_MAX: 887,
    }, // X 1455 -2655 Y 887 -2603
    de_dust2: {
        name: "de_dust2",
        imagePath: "/maps/de_dust2.png",
        X_MIN: -2203,
        X_MAX: 1787,
        Y_MIN: -1163,
        Y_MAX: 3117,
    }, //X 1787 -2182 Y 3117 -1163
    de_anubis: {
        name: "de_anubis",
        imagePath: "/maps/de_anubis.png",
        X_MIN: -1971,
        X_MAX: 1803,
        Y_MIN: -1803,
        Y_MAX: 3162,
    }, //X 1803 -1971 Y 3162 -1803
    de_ancient: {
        name: "de_ancient",
        imagePath: "/maps/de_ancient.png",
        X_MIN: -2300,
        X_MAX: 1395,
        Y_MIN: -2531,
        Y_MAX: 1771,
    }, // X 1395 -2300 Y 1771 -2531
    de_train: {
        name: "de_train",
        imagePath: "/maps/de_train.png",
        X_MIN: -2178,
        X_MAX: 1767,
        Y_MIN: -1798,
        Y_MAX: 1777,
    }, // X 1767 -2178 Y 1777 -1798
    de_nuke_upper: {
        name: "de_nuke_upper",
        imagePath: "/maps/de_nuke_upper.png",
        X_MIN: -2991,
        X_MAX: 3497,
        Y_MIN: -2479,
        Y_MAX: 934,
    }, // X 3497 -> -2991    Y 934 -> -2479
    de_nuke_lower: {
        name: "de_nuke_lower",
        imagePath: "/maps/de_nuke_lower.png",
        X_MIN: -2991,
        X_MAX: 3497,
        Y_MIN: -2479,
        Y_MAX: 934,
    }, // X 3497 -> -2991    Y 934 -> -2479
};

export function getMapInfo(mapName: string): MapInfo {
    return mapData[mapName];
}
