package db

import (
	"demo_parser/parser/structs"
	"fmt"
)

/*
	Insert new Parsed Demo
*/
func InsertDemo(demo *structs.DemoData) error {
	fmt.Println("insertion")
	query := `
	INSERT INTO demos (demo_id, series_id, team1, team2, rounds, map_name, uploaded_at)
	VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := DB.Exec(query,
		demo.DemoID,
		demo.SeriesID,
		demo.Team1,
		demo.Team2,
		demo.NumRounds,
		demo.Map,
		demo.UploadDate,
	)

	return err
}

/*
	Get all demos grouped by SeriesID
	Returns a map of series_id -> []DemoData
*/
func GetAllDemosGrouped() (map[string][]structs.DemoData, error) {
	query := `SELECT demo_id, series_id, team1, team2, rounds, map_name, uploaded_at FROM demos`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	grouped := make(map[string][]structs.DemoData)

	for rows.Next() {
		var demo structs.DemoData
		err := rows.Scan(
			&demo.DemoID,
			&demo.SeriesID,
			&demo.Team1,
			&demo.Team2,
			&demo.NumRounds,
			&demo.Map,
			&demo.UploadDate,
		)
		if err != nil {
			return nil, err
		}
		grouped[demo.SeriesID] = append(grouped[demo.SeriesID], demo)
	}

	return grouped, nil
}

