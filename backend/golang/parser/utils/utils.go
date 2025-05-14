package utils

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/common"

	"demo_parser/parser/structs"
)


func IsCT(p *common.Player) bool {
	if p == nil {
		return false
	}
	return p.Team == common.TeamCounterTerrorists
}

func GetPlayerName(p *common.Player) string {
	if p == nil {
		return ""
	}
	return p.Name
}

func WriteRoundToFile(round *structs.RoundData, demoID string) {
	fileName := fmt.Sprintf("r%d.json", round.RoundNum)
	outputDir := filepath.Join("parsed_demos", demoID)

	// Ensure the full path exists: parsed_demos/demoID/
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		fmt.Println("Failed to create directory:", err)
		return
	}

	// Now create the file inside that directory
	fullPath := filepath.Join(outputDir, fileName)
	f, err := os.Create(fullPath)
	if err != nil {
		fmt.Println("Failed to create file:", err)
		return
	}
	defer f.Close()

	encoder := json.NewEncoder(f)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(round); err != nil {
		fmt.Println("Failed to encode JSON:", err)
	}
}