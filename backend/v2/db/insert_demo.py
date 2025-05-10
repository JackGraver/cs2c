import datetime
import os
import sqlite3
from awpy import Demo
from polars import DataFrame

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")

def insert_parsed_demos(dem: Demo, demo_id: str, game_times: DataFrame, series_id: str = "") -> bool:
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Create table for demos
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS demos (
            demo_id TEXT PRIMARY KEY,
            series_id TEXT,
            demo_name TEXT,
            team1 TEXT,
            team2 TEXT,
            rounds INTEGER,
            map_name TEXT,
            uploaded_at TEXT
        )
        ''')

        teams = game_times['team_clan_name'].drop_nulls().unique()
        num_rounds = int(dem.rounds['round_num'].max())
        map_name = dem.header['map_name']

        # Add new demo
        cursor.execute('''
        INSERT INTO demos (demo_id, series_id, demo_name, team1, team2, rounds, map_name, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            demo_id,
            series_id,
            "temp_name",  # replace with actual name if available
            teams[0] if len(teams) > 0 else "Unknown",
            teams[1] if len(teams) > 1 else "Unknown",
            num_rounds,
            map_name,
            datetime.datetime.now().isoformat()
        ))

        conn.commit()
        return True

    except sqlite3.IntegrityError as e:
        print(f"Database error: {e}")  # useful for logging
        return False

    finally:
        conn.close()