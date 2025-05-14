package main

import (
	"bytes"
	"crypto/sha256"
	"demo_parser/db"
	"demo_parser/parser"
	"demo_parser/parser/handlers"
	"demo_parser/parser/structs"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs"
)

func main() {
	db.InitDB("demos.db")

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},  // Allow all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},  // Allowed methods
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},  // Allowed headers
		AllowCredentials: true,  // Allow credentials (cookies, etc.)
		MaxAge:           12 * time.Hour,  // Cache preflight requests for 12 hours
	}))

	router.GET("/", func(ctx *gin.Context) {
		data, err := db.GetAllDemosGrouped()
		if err != nil {
			ctx.JSON(500, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(data)
		ctx.JSON(200, gin.H{
			"demos": data,
		})
	})


	router.GET("/demo/:demo_id/round/:round_num", func(c *gin.Context) {
		demoID := c.Param("demo_id")
		roundNum := c.Param("round_num")

		// Construct the file path using demoID and roundNum
		filePath := filepath.Join("./parsed_demos", demoID, fmt.Sprintf("r%s.json", roundNum))

		// Attempt to read the JSON file
		data, err := os.ReadFile(filePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file", "details": err.Error()})
			return
		}

		// Unmarshal into an interface{} to serve as raw JSON
		var jsonData interface{}
		if err := json.Unmarshal(data, &jsonData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid JSON", "details": err.Error()})
			return
		}

		// Respond with the unmarshalled JSON data
		c.JSON(http.StatusOK, jsonData)
	})

	router.POST("/upload", func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid file upload"})
			return
		}

		openedFile, err := file.Open()
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to open uploaded file"})
			return
		}
		defer openedFile.Close()

		demo, first_round, err := parseDemo(openedFile)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		
		db.InsertDemo(demo)
		c.JSON(200, first_round)
	})

	router.Run() // listen and serve on 0.0.0.0:8080
}

func parseDemo(uploadedFile multipart.File) (*structs.DemoData, *structs.RoundData, error) {
	// Read the uploaded file into memory
	var buf bytes.Buffer
	if _, err := io.Copy(&buf, uploadedFile); err != nil {
		return nil, nil, err
	}

	// Hash the file contents
	hash := sha256.Sum256(buf.Bytes())
	demo_id := hex.EncodeToString(hash[:])

	// Create a new reader for the parser
	demoReader := bytes.NewReader(buf.Bytes())
	go_parser := demoinfocs.NewParser(demoReader)
	defer go_parser.Close()

	context := &handlers.HandlerContext{
		Parser: go_parser,
		DemoID: demo_id,
	}

	parser.CreateHandlers(context)

	if err := go_parser.ParseToEnd(); err != nil {
		return nil, nil, err
	}

	demoData := structs.DemoData {
		DemoID: demo_id,
		SeriesID: "",  
		Team1: "",  
		Team2: "",
		NumRounds: 0,
		Map: "",
		UploadDate: "", 
	}

	if context.FirstRound != nil {
		return &demoData, context.FirstRound, nil
	} else {
		return nil, nil, fmt.Errorf("no round parsed")
	}
}













// 	gameState := parser.GameState()

// 	var currentRound p.RoundData

// 	var allSmokes []p.SmokeMolly
// 	var allMollies  []p.SmokeMolly
// 	var allInAirGrenades []p.InAirGrenade
// 	var allShots []p.Shot
// 	var allKills []p.KillInfo
// 	var bombPlant *p.BombPlant

// 	roundIndex := 1
// 	tickCount := 0
// 	tickInterval := 8

// 	// Parse players and others
// 	parser.RegisterEventHandler(func(e events.FrameDone) {
// 		tick := parser.GameState().IngameTick()

// 		if tick%tickInterval != 0 {
// 			return
// 		}

// 		players := []p.Player{}

// 		for _, pl := range gameState.Participants().Playing() {
// 			inv := []string{}
// 			for _, w := range pl.Weapons() {
// 				if w != nil {
// 					inv = append(inv, w.Type.String())
// 				}
// 			}

// 			pos := pl.Position()

// 			players = append(players, p.Player{
// 				Name:        pl.Name,
// 				X:           int(pos.X),
// 				Y:           int(pos.Y),
// 				Z:           int(pos.Z),
// 				Health:      pl.Health(),
// 				Armor:       pl.Armor(),
// 				IsCT:        pl.Team == common.TeamCounterTerrorists,
// 				HasHelmet:   pl.HasHelmet(),
// 				HasDefuser:  pl.HasDefuseKit(),
// 				Blinded:     pl.IsBlinded(),
// 				Yaw:         int(pl.ViewDirectionX()), // you can scale if needed
// 				Inventory:   inv,
// 			})
// 		}

// 		tickData := p.TickData{
// 			Tick:           tick,
// 			LogicalTime:    "",
// 			Players:        players,
// 			Smokes:         allSmokes,
// 			Mollies:        allMollies,
// 			InAirGrenades:  allInAirGrenades,
// 			Shots:          allShots,
// 			Kills:          allKills,
// 			BombPlant:      bombPlant,
// 		}

// 		allKills = []p.KillInfo{} // Clear kills for next tick
// 		currentRound.Ticks = append(currentRound.Ticks, tickData)
// 		tickCount++
// 	})

// 	// Smoke and Molly
// 	parser.RegisterEventHandler(func(e events.InfernoStart) {
// 		inf := e.Inferno

// 		allSmokes = append(allSmokes, p.SmokeMolly{
// 			X:         inf.Entity.Position().X,
// 			Y:         inf.Entity.Position().Y,
// 			Z:         inf.Entity.Position().Z,
// 			EntityID:  int(inf.UniqueID()),
// 			ThrowerCT: isCT(inf.Thrower()),
// 		})
// 	})

// 	// In Air Grenades
// 	parser.RegisterEventHandler(func(e events.GrenadeProjectileThrow) {
// 		proj := e.Projectile
// 		allInAirGrenades = append(allInAirGrenades, p.InAirGrenade{
// 			X:        proj.Position().X,
// 			Y:        proj.Position().Y,
// 			Z:        proj.Position().Z,
// 			EntityID: int(proj.UniqueID()),
// 			Type:     int(proj.WeaponInstance.Type),    // 0=HE,1=Flash,2=Smoke,3=Molotov,4=Decoy
// 		})
// 	})

// 	parser.RegisterEventHandler(func(e events.BombPlanted) {
// 		bombPlant = &p.BombPlant{
// 			X: e.Player.Position().X,
// 			Y: e.Player.Position().Y,
// 			Z: e.Player.Position().Z,
// 		}
// 	})


// 	parser.RegisterEventHandler(func(e events.RoundStart) {
// 		currentRound = p.RoundData{RoundNum: roundIndex, Ticks: []p.TickData{}}
// 		allSmokes = []p.SmokeMolly{}
// 		fmt.Printf("setting all smokes to %d for round %d\n", len(allSmokes), roundIndex)
// 		allMollies  = []p.SmokeMolly{}
// 		allInAirGrenades = []p.InAirGrenade{}
// 		allShots = []p.Shot{}
// 		allKills = []p.KillInfo{}
// 		bombPlant = nil
// 	})

// 	parser.RegisterEventHandler(func(e events.RoundEnd) {
// 		fmt.Printf("writing all smokes to %d for round %d\n", len(allSmokes), roundIndex)
// 		writeRoundToFile(currentRound)
// 		roundIndex++
// 	})

// 	if err := parser.ParseToEnd(); err != nil {
// 		panic(err)
// 	}
// }

// func isCT(p *common.Player) bool {
// 	if p == nil {
// 		return false
// 	}
// 	return p.Team == common.TeamCounterTerrorists
// }

// func getPlayerName(p *common.Player) string {
// 	if p == nil {
// 		return ""
// 	}
// 	return p.Name
// }

// func writeRoundToFile(round p.RoundData) {
// 	fileName := fmt.Sprintf("r%d.json", round.RoundNum)
// 	_ = os.MkdirAll("output", os.ModePerm)
// 	f, err := os.Create(filepath.Join("output", fileName))
// 	if err != nil {
// 		fmt.Println("Failed to create file:", err)
// 		return
// 	}
// 	defer f.Close()

// 	encoder := json.NewEncoder(f)
// 	encoder.SetIndent("", "  ")
// 	err = encoder.Encode(round)
// 	if err != nil {
// 		fmt.Println("Failed to encode JSON:", err)
// 	}
// }
