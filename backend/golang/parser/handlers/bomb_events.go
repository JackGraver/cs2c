package handlers

import (
	"demo_parser/parser/structs"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)


func RegisterBombHandler(context *HandlerContext) {
	context.Parser.RegisterEventHandler(func(e events.BombPlanted) {
		context.CurrentRound.BombPlantTime = context.Parser.CurrentTime()

		context.CurrentRound.BombPlant = &structs.BombPlant {
			Tick: context.Parser.GameState().IngameTick(),
			X: e.Player.Position().X,
			Y: e.Player.Position().Y,
			Z: e.Player.Position().Z,
		}
	})
}