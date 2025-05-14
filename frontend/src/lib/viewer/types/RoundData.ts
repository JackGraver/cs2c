export type RoundData = {
    round_num: number;
    winner_ct: boolean;
    team_ct: string;
    team_t: string;
    loaded?: boolean;
    had_timeout: boolean;
    ct_score: number;
    t_score: number;
};
