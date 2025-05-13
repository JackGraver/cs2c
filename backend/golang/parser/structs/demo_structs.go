package structs

type Player struct {
	X          int      `json:"x"`
	Y          int      `json:"y"`
	Z          int      `json:"z"`
	Name       string   `json:"name"`
	IsCT       bool     `json:"isCT"`
	Health     int      `json:"health"`
	Blinded    bool     `json:"blinded"`
	HasArmor   bool     `json:"hasArmor"`
	HasHelmet  bool     `json:"hasHelmet"`
	HasDefuser bool     `json:"hasDefuser"`
	Yaw        int      `json:"yaw"`
	Inventory  []string `json:"inventory"`
}

type SmokeMolly struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Z         float64 `json:"z"`
	EntityID  int     `json:"entityId"`
	ThrowerCT bool    `json:"throwerCT"`
}

type InAirGrenade struct {
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Z        float64 `json:"z"`
	EntityID int     `json:"entityId"`
	Type     int     `json:"type"`
}

type Shot struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Z      float64 `json:"z"`
	ShotID int     `json:"shotId"`
	Yaw    int     `json:"yaw"`
}

type KillInfo struct {
	FlashAssist     bool   `json:"flashAssist"`
	Assister        string `json:"assister"`
	AssisterCT      bool   `json:"assisterCT"`
	Attacker        string `json:"attacker"`
	AttackerCT      bool   `json:"attackerCT"`
	AttackerBlinded bool   `json:"attackerBlinded"`
	AttackerInAir   bool   `json:"attackerInAir"`
	Headshot        bool   `json:"headshot"`
	Noscope         bool   `json:"noscope"`
	Penetrated      bool   `json:"penetrated"`
	ThruSmoke       bool   `json:"thruSmoke"`
	Weapon          int    `json:"weapon"`
	Victim          string `json:"victim"`
	VictimCT        bool   `json:"victimCT"`
}

type BombPlant struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

type TickData struct {
	Tick          int            `json:"tick"`
	LogicalTime   string         `json:"logicalTime"`
	Players       []Player       `json:"players"`
	Smokes        []SmokeMolly   `json:"smokes"`
	Mollies       []SmokeMolly   `json:"mollies"`
	InAirGrenades []InAirGrenade `json:"inAirGrenades"`
	Shots         []Shot         `json:"shots"`
	Kills         []KillInfo     `json:"kills"`
	BombPlant     *BombPlant     `json:"bombPlant,omitempty"`
}

type RoundData struct {
	RoundNum   int        `json:"round"`
	WinnerCT   bool       `json:"winnerCT"`
	HadTimeout bool       `json:"hadTimeout"`
	CTScore    int        `json:"ctScore"`
	TScore     int        `json:"tScore"`
	Ticks      []TickData `json:"ticks"`
}