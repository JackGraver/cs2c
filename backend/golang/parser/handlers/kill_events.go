package handlers

import (
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"
	"fmt"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

func RegisterKillHandlers(context *HandlerContext) {
	fmt.Println("?")
	context.Parser.RegisterEventHandler(func(e events.WeaponFire) {
		shooter := e.Shooter

		pos := shooter.Position()
		weaponFire := structs.Shot{
			X:      pos.X,
			Y:      pos.Y,
			Z:      pos.Z,
			ShotID: int(shooter.EntityID), // or a sequence counter if you prefer
			Yaw:    int(shooter.ViewDirectionX()),
		}
		context.WeaponFires = append(context.WeaponFires, weaponFire)
	})

	context.Parser.RegisterEventHandler(func(e events.Kill) {
		kill := structs.Kill{
			FlashAssist:     e.AssistedFlash,
			Assister:        utils.GetPlayerName(e.Assister),
			AssisterCT:      utils.IsCT(e.Assister),
			Attacker:        utils.GetPlayerName(e.Killer),
			AttackerCT:      utils.IsCT(e.Killer),
			AttackerBlinded: e.Killer != nil && e.Killer.IsBlinded(),
			AttackerInAir:   e.Killer != nil && e.Killer.IsAirborne(),
			Headshot:        e.IsHeadshot,
			Noscope:         e.NoScope,
			Penetrated:      e.PenetratedObjects > 0,
			ThruSmoke:       e.ThroughSmoke,
			Weapon:          int(e.Weapon.Type),
			Victim:          utils.GetPlayerName(e.Victim),
			VictimCT:        utils.IsCT(e.Victim),
		}
		context.Deaths = append(context.Deaths, kill)
	})
}
