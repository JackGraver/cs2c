package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB(path string) {
	var err error
	DB, err = sql.Open("sqlite", path)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS demos (
		demo_id TEXT PRIMARY KEY,
		series_id TEXT,
		demo_name TEXT,
		team1 TEXT,
		team2 TEXT,
		rounds INTEGER,
		map_name TEXT,
		uploaded_at TEXT
	);`
	if _, err := DB.Exec(createTable); err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
	fmt.Println("Finished DB init")
}
