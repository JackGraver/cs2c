export type Player = {
    X: number;
    Y: number;
    Z: number;
    name: string;
    is_ct: boolean;
    health: number;
    blinded: number;
    armor: number;
    has_helmet: boolean;
    has_defuser: boolean;
    yaw: number;
    team_clan_name: string;
    inventory: number[];
};
