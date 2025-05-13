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

func WriteRoundToFile(round *structs.RoundData) {
	fileName := fmt.Sprintf("r%d.json", round.RoundNum)
	_ = os.MkdirAll("parsed_demos", os.ModePerm)
	f, err := os.Create(filepath.Join("output", fileName))
	if err != nil {
		fmt.Println("Failed to create file:", err)
		return
	}
	defer f.Close()

	encoder := json.NewEncoder(f)
	encoder.SetIndent("", "  ")
	err = encoder.Encode(round)
	if err != nil {
		fmt.Println("Failed to encode JSON:", err)
	}
}