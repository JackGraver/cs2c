package handlers

import (
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

func RegisterRoundHandler(context *HandlerContext) {
	context.Parser.RegisterEventHandler(func(e events.RoundFreezetimeChanged) {
		context.DemoData.NumRounds = context.Parser.GameState().TotalRoundsPlayed() + 1
	
		context.CurrentRound = &structs.RoundData{
			RoundNum:   context.Parser.GameState().TotalRoundsPlayed() + 1,
			WinnerCT:   false, 
			TeamCT:   	context.Parser.GameState().TeamCounterTerrorists().ClanName(),
			TeamT:      context.Parser.GameState().TeamTerrorists().ClanName(),
			HadTimeout: false, 
			CTScore:    context.Parser.GameState().TeamCounterTerrorists().Score(),
			TScore:     context.Parser.GameState().TeamTerrorists().Score(),
			Ticks:      []structs.TickData{},

			StartTime: context.Parser.CurrentTime(),
			// BombPlanted: time.Duration(0),
		}

		context.ActiveSmokes = make(map[int]structs.SmokeMolly)
		context.ActiveMollies = make(map[int]structs.SmokeMolly)
		context.InAirGrenades = make(map[int]structs.InAirGrenade)
	})

	context.Parser.RegisterEventHandler(func(e events.RoundEnd) {
		if context.FirstRound == nil {
			context.FirstRound = context.CurrentRound
			context.DemoData.Team1 = context.FirstRound.TeamCT
			context.DemoData.Team2 = context.FirstRound.TeamT
		}
		var currentRound = context.CurrentRound
		currentRound.WinnerCT = e.Winner == 3

		utils.WriteRoundToFile(currentRound, context.DemoData.DemoID)
		context.AllRounds = append(context.AllRounds, *currentRound)
	})
}