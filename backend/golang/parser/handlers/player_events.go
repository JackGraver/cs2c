package handlers

import (
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

const tickInterval = 8

func RegisterPlayerHandler(context *HandlerContext) {
	context.Parser.RegisterEventHandler(func(e events.FrameDone) {
		tick := context.Parser.GameState().IngameTick()

		if tick % tickInterval != 0 {
			return
		}
		
		players := []structs.Player{}

		for _, pl := range context.Parser.GameState().Participants().Playing() {
			inv := []string{}
			for _, w := range pl.Weapons() {
				if w != nil {
					inv = append(inv, w.Type.String())
				}
			}

			pos := pl.Position()

			players = append(players, structs.Player{
				Name:       pl.Name,
				X:          int(pos.X),
				Y:          int(pos.Y),
				Z:          int(pos.Z),
				Health:     pl.Health(),
				HasArmor:   pl.Armor() != 0,
				IsCT:       utils.IsCT(pl),
				HasHelmet:  pl.HasHelmet(),
				HasDefuser: pl.HasDefuseKit(),
				Blinded:    pl.IsBlinded(),
				Yaw:        int(pl.ViewDirectionX()),
				Inventory:  inv,
			})
		}

		if context.CurrentRound == nil {
			context.CurrentRound = &structs.RoundData{}
		}
		
		smokes := make([]structs.SmokeMolly, 0, len(context.ActiveSmokes))
		for _, smoke := range context.ActiveSmokes {
			smokes = append(smokes, smoke)
		}

		mollies := make([]structs.SmokeMolly, 0, len(context.ActiveMollies))
		for _, molly := range context.ActiveMollies {
			mollies = append(mollies, molly)
		}

		inAir := make([]structs.InAirGrenade, 0, len(context.InAirGrenades))
		entities := context.Parser.GameState().Entities()

		for id, grenade := range context.InAirGrenades {
			if entities[id] != nil {
				// fmt.Printf("Grenade ID %d is in entities\n", id)
				inAir = append(inAir, grenade)
			}
		}

		tickData := structs.TickData{
			Tick:    tick,
			Players: players,
			Smokes: smokes,
			Mollies: mollies,
			InAirGrenades: inAir,
		}
		context.CurrentRound.Ticks = append(context.CurrentRound.Ticks, tickData)
	})
}
