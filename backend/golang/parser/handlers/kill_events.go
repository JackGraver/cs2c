package handlers

func RegisterKillHandlers(ctx *HandlerContext) {
	// ctx.Parser.RegisterEventHandler(func(e events.WeaponFire) {
	// 	shooter := e.Shooter
	// 	pos := shooter.Position()
	// 	allShots = append(allShots, p.Shot{
	// 		X:      pos.X,
	// 		Y:      pos.Y,
	// 		Z:      pos.Z,
	// 		ShotID: int(e.Shooter.EntityID), // or a sequence counter if you prefer
	// 		Yaw:    int(shooter.ViewDirectionX()),
	// 	})
	// })

	// ctx.Parser.RegisterEventHandler(func(e events.Kill) {
	// 	tick := parser.GameState().IngameTick()
	// 	if tick%tickInterval != 0 {
	// 		return
	// 	}

	// 	kill := p.KillInfo{
	// 		FlashAssist:     e.AssistedFlash,
	// 		Assister:        getPlayerName(e.Assister),
	// 		AssisterCT:      isCT(e.Assister),
	// 		Attacker:        getPlayerName(e.Killer),
	// 		AttackerCT:      isCT(e.Killer),
	// 		AttackerBlinded: e.Killer != nil && e.Killer.IsBlinded(),
	// 		AttackerInAir:   e.Killer != nil && e.Killer.IsAirborne(),
	// 		Headshot:        e.IsHeadshot,
	// 		Noscope:         e.NoScope,
	// 		Penetrated:      e.PenetratedObjects > 0,
	// 		ThruSmoke:       e.ThroughSmoke,
	// 		Weapon:          int(e.Weapon.Type),
	// 		Victim:          getPlayerName(e.Victim),
	// 		VictimCT:        isCT(e.Victim),
	// 	}
	// 	allKills = append(allKills, kill)
	// })
}
