package structs

import "time"

type Player struct {
	X          int      `json:"X"`
	Y          int      `json:"Y"`
	Z          int      `json:"Z"`
	Name       string   `json:"name"`
	IsCT       bool     `json:"is_ct"`
	Health     int      `json:"health"`
	Blinded    bool     `json:"blinded"`
	HasArmor   bool     `json:"has_armor"`
	HasHelmet  bool     `json:"has_helmet"`
	HasDefuser bool     `json:"has_defuser"`
	Yaw        int      `json:"yaw"`
	Inventory  []string `json:"inventory"`
}

type SmokeMolly struct {
	X         float64 `json:"X"`
	Y         float64 `json:"Y"`
	Z         float64 `json:"Z"`
	EntityID  int     `json:"entity_id"`
	ThrowerCT bool    `json:"thrower_ct"`
}

type InAirGrenade struct {
	X        float64 `json:"X"`
	Y        float64 `json:"Y"`
	Z        float64 `json:"Z"`
	EntityID int     `json:"entity_id"`
	Type     int     `json:"type"`
}

type Shot struct {
	X      float64 `json:"X"`
	Y      float64 `json:"Y"`
	Z      float64 `json:"Z"`
	ShotID int     `json:"shot_id"`
	Yaw    int     `json:"yaw"`
}

type KillInfo struct {
	FlashAssist     bool   `json:"assistedflash"`
	Assister        string `json:"assister"`
	AssisterCT      bool   `json:"assister_ct"`
	Attacker        string `json:"attacker"`
	AttackerCT      bool   `json:"attacker_ct"`
	AttackerBlinded bool   `json:"attackerblind"`
	AttackerInAir   bool   `json:"attackerinair"`
	Headshot        bool   `json:"headshot"`
	Noscope         bool   `json:"noscope"`
	Penetrated      bool   `json:"penetrated"`
	ThruSmoke       bool   `json:"thruSmoke"`
	Weapon          int    `json:"weapon"`
	Victim          string `json:"victim"`
	VictimCT        bool   `json:"victim_ct"`
}

type BombPlant struct {
	X float64 `json:"X"`
	Y float64 `json:"Y"`
	Z float64 `json:"Z"`
}

type TickData struct {
	Tick          int            `json:"tick"`
	LogicalTime   string         `json:"logical_time"`
	Players       []Player       `json:"players"`
	Smokes        []SmokeMolly   `json:"smokes"`
	Mollies       []SmokeMolly   `json:"mollies"`
	InAirGrenades []InAirGrenade `json:"in_air_grenades"`
	Shots         []Shot         `json:"shots"`
	Kills         []KillInfo     `json:"kills"`
	BombPlant     *BombPlant     `json:"bomb_plant,omitempty"`
}

type RoundData struct {
	RoundNum   int        `json:"round_num"`
	WinnerCT   bool       `json:"winner_ct"`
	TeamCT     string     `json:"team_ct"`
	TeamT      string     `json:"team_t"`
	HadTimeout bool       `json:"had_timeout"`
	CTScore    int        `json:"ct_score"`
	TScore     int        `json:"t_score"`
	Ticks      []TickData `json:"ticks"`
	StartTime  time.Duration
}

type RoundDataWithoutTicks struct {
	RoundNum    int            `json:"round_num"`
	WinnerCT    bool           `json:"winner_ct"`
	TeamCT      string         `json:"team_ct"`
	TeamT       string         `json:"team_t"`
	HadTimeout  bool           `json:"had_timeout"`
	CTScore     int            `json:"ct_score"`
	TScore      int            `json:"t_score"`
}

type DemoData struct {
	DemoID     string `json:"demo_id"`
	SeriesID   string `json:"series_id"`
	Team1      string `json:"team1"`
	Team2      string `json:"team2"`
	NumRounds  int    `json:"num_rounds"`
	Map        string `json:"map_name"`
	UploadDate string `json:"uploaded_at"`
}