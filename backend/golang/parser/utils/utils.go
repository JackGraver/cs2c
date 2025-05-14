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

func WriteRounds(rounds []structs.RoundData, demoID string) error {
	outputDir := filepath.Join("parsed_demos", demoID)

	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	fullPath := filepath.Join(outputDir, "r_info.json")

	// Convert to stripped-down version
	strippedRounds := make([]structs.RoundDataWithoutTicks, 0, len(rounds))
	for _, r := range rounds {
		strippedRounds = append(strippedRounds, structs.RoundDataWithoutTicks{
			RoundNum:   r.RoundNum,
			WinnerCT:   r.WinnerCT,
			TeamCT:     r.TeamCT,
			TeamT:      r.TeamT,
			HadTimeout: r.HadTimeout,
			CTScore:    r.CTScore,
			TScore:     r.TScore,
		})
	}

	data, err := json.MarshalIndent(strippedRounds, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

func ReadRounds(demoID string) ([]structs.RoundDataWithoutTicks, error) {
	filePath := filepath.Join("parsed_demos", demoID, "r_info.json")

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read r_info.json: %w", err)
	}

	var rounds []structs.RoundDataWithoutTicks
	if err := json.Unmarshal(data, &rounds); err != nil {
		return nil, fmt.Errorf("failed to parse r_info.json: %w", err)
	}

	return rounds, nil
}