export type Player = {
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
    team_name: string;
};
