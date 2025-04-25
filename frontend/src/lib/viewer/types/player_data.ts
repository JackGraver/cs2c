import { PlayerDot } from "../models/playerdot";

export type Player = {
    display: PlayerDot;
    X: number;
    Y: number;
    name: string;
    side: "ct" | "t";
    health: number;
    yaw: number;
    defuser: boolean;
    bomb: boolean;
    knife: string;
    primary: string;
    secondary: string;
    grenades: string[];
};

// 'name': 'Spinx',
// 'X': 2472.349853515625,
// 'Y': 2005.969970703125,
// 'side': 'ct',
// 'health': 100,
// 'yaw': 160.00006103515625,
// 'knife': 'M9 Bayonet',
// 'secondary': 'USP-S',
// 'primary': None,
// 'grenades': []
