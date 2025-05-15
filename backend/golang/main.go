package main

import (
	"archive/zip"
	"demo_parser/db"
	"demo_parser/parser"
	"demo_parser/parser/handlers"
	"demo_parser/parser/structs"
	"demo_parser/parser/utils"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs"
	msg "github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/msgs2"
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
		
		rounds, err := utils.ReadRounds(demoID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := gin.H{
			"demo_info": jsonData,
			"rounds":    rounds,
		}

		c.JSON(http.StatusOK, response)
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

		// Check the file extension
		fileExt := strings.ToLower(filepath.Ext(file.Filename))

		switch fileExt {
		case ".zip":
			// If it's a .zip file, read it as a zip and extract files inside
			r, err := zip.NewReader(openedFile, file.Size)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to read zip file"})
				return
			}

			demo, err := parseZip(r.File)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, demo)
			return
		case ".dem":
			demo, err := parseDemo(openedFile)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			
			db.InsertDemo(demo)
			c.JSON(200, demo)
			return
		default:
			c.JSON(400, gin.H{"error": "Invalid file type. Only .zip or .dem are allowed"})
			return
		}
	})

	router.Run() // listen and serve on 0.0.0.0:8080
}

func parseZip(files []*zip.File) (*structs.DemoData, error) {
	series_id := uuid.New().String()

	var firstDemo *structs.DemoData

	for _, f := range files {
		if filepath.Ext(f.Name) == ".dem" {
			fmt.Println("parse", f.Name)

			// Open the file to get an io.ReadCloser
			rc, err := f.Open()
			if err != nil {
				fmt.Printf("failed to open file %s: %v\n", f.Name, err)
				continue
			}
			defer rc.Close()

			go_parser := demoinfocs.NewParser(rc)
			defer go_parser.Close()

			demo_id := uuid.New().String()

			context := &handlers.HandlerContext{
				Parser: go_parser,
				DemoData: &structs.DemoData {
					DemoID: demo_id,
					SeriesID: series_id,  
					NumRounds: 0,
					Map: "",
					UploadDate: time.Now().Format(time.RFC3339), 
				},
			}

			go_parser.RegisterNetMessageHandler(func(msg *msg.CSVCMsg_ServerInfo) {
				context.DemoData.Map = msg.GetMapName()
			})

			parser.CreateHandlers(context)

			if err := go_parser.ParseToEnd(); err != nil {
				return nil, err
			}

			if context.FirstRound != nil {
				err := utils.WriteRounds(context.AllRounds, demo_id)
				if err != nil {
					return nil, fmt.Errorf("failed writing all rounds file for %s", f.Name)
				}
				db.InsertDemo(context.DemoData)

				if firstDemo == nil {
					firstDemo = context.DemoData
				}
			} else {
				return nil, fmt.Errorf("no round parsed for %s", f.Name)
			}
		}
	}

	return firstDemo, nil
}

func parseDemo(uploadedFile multipart.File) (*structs.DemoData, error) {
	go_parser := demoinfocs.NewParser(uploadedFile)
	defer go_parser.Close()

	demo_id := uuid.New().String()

	context := &handlers.HandlerContext{
		Parser: go_parser,
		DemoData: &structs.DemoData {
			DemoID: demo_id,
			SeriesID: uuid.New().String(),  
			NumRounds: 0,
			Map: "",
			UploadDate: time.Now().Format(time.RFC3339), 
		},
	}

	go_parser.RegisterNetMessageHandler(func(msg *msg.CSVCMsg_ServerInfo) {
		context.DemoData.Map = msg.GetMapName()
	})

	parser.CreateHandlers(context)

	if err := go_parser.ParseToEnd(); err != nil {
		return nil, err
	}

	if context.FirstRound != nil {
		err := utils.WriteRounds(context.AllRounds, demo_id)
		if err != nil {
			return nil, fmt.Errorf("failed writing all rounds file")
		}
		return context.DemoData, nil
	} else {
		return nil, fmt.Errorf("no round parsed")
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
