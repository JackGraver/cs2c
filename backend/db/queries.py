from collections import defaultdict
import datetime
import os
import shutil
import sqlite3
import polars as pl
from awpy import Demo

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")

def add_parsed_demos(dem: Demo, demo_id: str, game_times: pl.DataFrame, series_id: str = "") -> bool:
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
    
def remove_parsed_demo(demo_id: str) -> bool:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # Check if the demo_id exists in the database
        cur.execute("SELECT COUNT(*) FROM demos WHERE demo_id = ?", (demo_id,))
        if cur.fetchone()[0] == 0:
            conn.close()
            return False  # Demo does not exist, so no need to delete
        
        # Delete the demo from the database
        cur.execute("DELETE FROM demos WHERE demo_id = ?", (demo_id,))
        conn.commit()
        
        # Check if the deletion was successful by verifying that the demo_id no longer exists
        cur.execute("SELECT COUNT(*) FROM demos WHERE demo_id = ?", (demo_id,))
        if cur.fetchone()[0] != 0:
            conn.close()
            return False  # Failed to delete demo
        
        conn.close()
        return True  # Demo successfully deleted from the database
    except Exception as e:
        print(f"Error removing parsed demo: {e}")
        return False
    
def get_all_known_demos() -> dict[str, list[dict]]:
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM demos")
        rows = cursor.fetchall()

        grouped = defaultdict(list)
        for row in rows:
            row_dict = dict(row)
            series_id = row_dict.get("series_id", "unknown")
            grouped[series_id].append(row_dict)

        return dict(grouped)

    except Exception as e:
        print(f"Database error: {e}")
        return {}
    finally:
        conn.close()
        
def new_tournament(name: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Create table for demos
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tournaments (
            tournament_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_name TEXT,
            date TEXT
        )
        ''')

        # Add new demo
        cursor.execute('''
        INSERT INTO tournaments (tournament_name)
        VALUES (?)
        ''', (name,))

        conn.commit()
        return True

    except sqlite3.IntegrityError as e:
        print(f"Database error: {e}")  # useful for logging
        return False

    finally:
        conn.close()
    
def get_all_tournaments() -> list[dict]:
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # To return dict-like rows
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tournaments")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Database error: {e}")
        return []
    finally:
        conn.close()
             
def get_all_series():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enables dict-like access
    cursor = conn.cursor()

    # Fetch all demos ordered by series and upload time
    cursor.execute("SELECT * FROM demos ORDER BY series_id, uploaded_at")
    rows = cursor.fetchall()
    conn.close()

    # Group demos by series_id
    grouped = {}
    for row in rows:
        series_id = row["series_id"]
        demo = {
            "id": row["demo_id"],
            "name": row["demo_name"],
            "team1": row["team1"],
            "team2": row["team2"],
            "rounds": row["rounds"],
            "map_name": row["map_name"],
            "uploaded_at": row["uploaded_at"]
        }

        if series_id not in grouped:
            grouped[series_id] = []
        grouped[series_id].append(demo)

    return grouped

def get_all_series_maps(demo_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # First, get the series_id for the given demo_id
    cursor.execute('SELECT series_id FROM demos WHERE demo_id = ?', (demo_id,))
    result = cursor.fetchone()
    
    if result is None:
        conn.close()
        return []  # Demo not found

    series_id = result["series_id"]

    # Now fetch all demos with the same series_id
    cursor.execute('SELECT * FROM demos WHERE series_id = ?', (series_id,))
    rows = cursor.fetchall()
    conn.close()

    # Format each row into a dictionary
    demos = []
    for row in rows:
        demo = {
            "id": row["demo_id"],
            "name": row["demo_name"],
            "team1": row["team1"],
            "team2": row["team2"],
            "rounds": row["rounds"],
            "map_name": row["map_name"],
            "uploaded_at": row["uploaded_at"]
        }
        demos.append(demo)

    return demos