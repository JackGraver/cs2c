package handlers

import (
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

func RegisterRoundHandler(context *HandlerContext) {
	context.Parser.RegisterEventHandler(func(e events.RoundStart) {
		// fmt.Println("start round")

		context.CurrentRound = &structs.RoundData{
			RoundNum:   context.Parser.GameState().TotalRoundsPlayed() + 1,
			WinnerCT:   false, 
			HadTimeout: false, 
			CTScore:    context.Parser.GameState().TeamCounterTerrorists().Score(),
			TScore:     context.Parser.GameState().TeamTerrorists().Score(),
			Ticks:      []structs.TickData{},
		}
		context.ActiveSmokes = make(map[int]structs.SmokeMolly)
		context.ActiveMollies = make(map[int]structs.SmokeMolly)
		context.InAirGrenades = make(map[int]structs.InAirGrenade)
	})

	context.Parser.RegisterEventHandler(func(e events.RoundEnd) {
		if context.FirstRound == nil {
			context.FirstRound = context.CurrentRound
		}
		var currentRound = context.CurrentRound
		utils.WriteRoundToFile(currentRound)
	})
}