package parser

import (
	"demo_parser/parser/handlers"
)

func CreateHandlers(context *handlers.HandlerContext) {
	handlers.RegisterGrenadeHandlers(context)
	handlers.RegisterPlayerHandler(context)
	handlers.RegisterRoundHandler(context)
	handlers.RegisterBombHandler(context)
	handlers.RegisterKillHandlers(context)
}
