package handlers

import (
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"
	"fmt"
	"sort"
	"time"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

const tickInterval = 8


func formatRoundTime(current, roundStart, bombPlantTime time.Duration) string {
	const (
		fullRoundDuration = 116 * time.Second // 1:55
		bombTimerDuration = 40 * time.Second  // 0:40
	)

	// Bomb has not been planted yet
	if bombPlantTime == 0 || current < bombPlantTime {
		elapsed := current - roundStart
		if elapsed < 0 {
			elapsed = 0
		}
		remaining := fullRoundDuration - elapsed
		if remaining < 0 {
			remaining = 0
		}
		totalSeconds := int(remaining.Seconds())
		minutes := totalSeconds / 60
		seconds := totalSeconds % 60
		return fmt.Sprintf("%d:%02d", minutes, seconds)
	}

	// Bomb has been planted, show bomb timer countdown
	elapsedSincePlant := current - bombPlantTime
	remaining := bombTimerDuration - elapsedSincePlant
	if remaining < 0 {
		remaining = 0
	}
	totalSeconds := int(remaining.Seconds())
	minutes := totalSeconds / 60
	seconds := totalSeconds % 60
	return fmt.Sprintf("%d:%02d", minutes, seconds)
}

func RegisterPlayerHandler(context *HandlerContext) {
	context.Parser.RegisterEventHandler(func(e events.FrameDone) {		
		tick := context.Parser.GameState().IngameTick()
		
		if context.CurrentRound == nil {
			return
		}
		
		numTicks := len(context.CurrentRound.Ticks)
		if numTicks > 0 && context.CurrentRound.Ticks[numTicks-1].Tick == tick {
			// Skip if this tick is already recorded
			return
		}

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


			activeWeapon := ""
			if pl.ActiveWeapon() != nil {
				activeWeapon = pl.ActiveWeapon().String()
			}

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
				CurrentWeapon: activeWeapon,
				Grenades: inv,
			})
		}

		sort.Slice(players, func(i, j int) bool {
			return players[i].Name < players[j].Name
		})

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
			entity, exists := entities[id]
			if !exists || entity == nil {
				continue
			}

			pos := entity.Position()
			inAir = append(inAir, structs.InAirGrenade{
				X:        pos.X,
				Y:        pos.Y,
				Z:        pos.Z,
				EntityID: id,
				Type:     grenade.Type,
			})
		}

		tickData := structs.TickData{
			Tick:    tick,
			LogicalTime: formatRoundTime(context.Parser.CurrentTime(), context.CurrentRound.StartTime, context.CurrentRound.BombPlantTime),
			Players: players,
			Smokes: smokes,
			Mollies: mollies,
			InAirGrenades: inAir,
			Shots: context.WeaponFires,
			Kills: context.Deaths,
		}
		context.WeaponFires = []structs.Shot{}
		context.Deaths = []structs.Kill{}

		context.CurrentRound.Ticks = append(context.CurrentRound.Ticks, tickData)
	})
}
