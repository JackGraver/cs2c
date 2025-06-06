package handlers

import (
	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs"

	"demo_parser/parser/structs"
)

type HandlerContext struct {
	Parser        	demoinfocs.Parser
	DemoData 	  	*structs.DemoData
	CurrentRound  	*structs.RoundData
	FirstRound    	*structs.RoundData
	AllRounds	  	[]structs.RoundData
	ActiveSmokes  	map[int]structs.SmokeMolly
	ActiveMollies 	map[int]structs.SmokeMolly
	InAirGrenades 	map[int]structs.InAirGrenade
	WeaponFires 	[]structs.Shot
	Deaths 			[]structs.Kill
}
