package handlers

import (
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

/*

	EqDecoy      EquipmentType = 501
	EqMolotov    EquipmentType = 502
	EqIncendiary EquipmentType = 503
	EqFlash      EquipmentType = 504
	EqSmoke      EquipmentType = 505
	EqHE         EquipmentType = 506
*/
func grenadeTypeConversion(weaponType int) int {
	switch weaponType {
		case 501:
			return 10 // smoke
		case 502:
			return 3  // flash
		case 503:
			return 3  // HE
		case 504:
			return 1  // decoy
		case 505:
			return 2  // molotov
		case 506:
			return 4  // incendiary
		default:
			return 0 // unknown or unsupported grenade type
		}
	}

func RegisterGrenadeHandlers(context *HandlerContext) {	
	context.Parser.RegisterEventHandler(func (e events.GrenadeProjectileThrow) {
		// fmt.Println("grenade thrown", e.Projectile.Entity.ID())

		thrownGrenade := structs.InAirGrenade {
			X: e.Projectile.Position().X,
			Y: e.Projectile.Position().Y,
			Z: e.Projectile.Position().Z,
			EntityID: e.Projectile.Entity.ID(),
			Type: grenadeTypeConversion(int(e.Projectile.WeaponInstance.Type)),
		}

		context.InAirGrenades[e.Projectile.Entity.ID()] = thrownGrenade
	})

	context.Parser.RegisterEventHandler(func (e events.GrenadeProjectileDestroy) {
		delete(context.InAirGrenades, e.Projectile.Entity.ID())
	})

	context.Parser.RegisterEventHandler(func (e events.HeExplode) {
		delete(context.InAirGrenades, e.GrenadeEntityID)
	})

	context.Parser.RegisterEventHandler(func(e events.SmokeStart) {
		lastTickIndex := len(context.CurrentRound.Ticks) - 1
		if lastTickIndex < 0 {
			return 
		}
		// tickPtr := &context.CurrentRound.Ticks[lastTickIndex]

		poppedSmoke := e
		newSmoke := structs.SmokeMolly{
			X:         poppedSmoke.Position.X,
			Y:         poppedSmoke.Position.Y,
			Z:         poppedSmoke.Position.Z,
			EntityID:  int(poppedSmoke.GrenadeEntityID),
			ThrowerCT: utils.IsCT(e.Thrower),
		}

		context.ActiveSmokes[newSmoke.EntityID] = newSmoke
		// tickPtr.Smokes = append(tickPtr.Smokes, newSmoke)
	})

	context.Parser.RegisterEventHandler(func(e events.SmokeExpired) {
		lastTickIndex := len(context.CurrentRound.Ticks) - 1
		if lastTickIndex < 0 {
			return 
		}
		// tickPtr := &context.CurrentRound.Ticks[lastTickIndex]

		// poppedSmoke := e
		// newSmoke := structs.SmokeMolly{
		// 	X:         poppedSmoke.Position.X,
		// 	Y:         poppedSmoke.Position.Y,
		// 	Z:         poppedSmoke.Position.Z,
		// 	EntityID:  int(poppedSmoke.GrenadeEntityID),
		// 	ThrowerCT: utils.IsCT(e.Thrower),
		// }

		delete(context.ActiveSmokes, int(e.GrenadeEntityID))
		// tickPtr.Smokes = append(tickPtr.Smokes, newSmoke)
	})

	context.Parser.RegisterEventHandler(func(e events.InfernoStart) {
		// lastTickIndex := len(context.CurrentRound.Ticks) - 1
		// if lastTickIndex < 0 {
		// 	return 
		// }
		// tickPtr := &context.CurrentRound.Ticks[lastTickIndex]

		inf := e.Inferno
		newMolly := structs.SmokeMolly{
			X:         inf.Entity.Position().X,
			Y:         inf.Entity.Position().Y,
			Z:         inf.Entity.Position().Z,
			EntityID:  int(inf.UniqueID()),
			ThrowerCT: utils.IsCT(inf.Thrower()),
		}

		context.ActiveMollies[newMolly.EntityID] = newMolly
		// tickPtr.Mollies = append(tickPtr.Mollies, newMolly)
	})

	context.Parser.RegisterEventHandler(func(e events.InfernoExpired) {
		delete(context.ActiveMollies, int(e.Inferno.UniqueID()))
	})
}