import os
from typing import List, Dict, Any
import polars as pl
from awpy import Demo  # or from awpy.parser import Demo depending on your version

SECONDARIES = {"USP-S", "Glock", "P250", "Five-SeveN", "Dual Berettas", "Tec-9", "Desert Eagle"}
PRIMARIES = {"AK-47", "M4A1-S", "AWP", "FAMAS", "Galil AR"}
GRENADES = {"Flashbang", "Smoke Grenade", "Molotov", "High Explosive Grenade", "Decoy", "Incendiary Grenade"}

def classify_inventory(items: List[str]) -> Dict[str, Any]:
    knife = items[0] if items else None
    secondary = None
    primary = None
    grenades = []

    for item in items[1:]:
        if item in SECONDARIES:
            secondary = item
        elif item in PRIMARIES:
            primary = item
        elif item in GRENADES:
            grenades.append(item)

    return {
        "knife": knife,
        "secondary": secondary,
        "primary": primary,
        "grenades": grenades
    }

def format_clock(seconds: float) -> str:
    m = int(seconds) // 60
    s = int(seconds) % 60
    return f"{m}:{s:02}"

class Parser:
    def __init__(self):
        self.output_dir = "parsed_demos"

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    def parse_demo(self, file_path: bytes):
        try:
            dem = Demo(file_path, verbose=False)
            dem.parse(player_props=["health", "armor_value", "yaw", "inventory"])
            game_times = dem.parse_ticks(other_props=["game_time"])
            
            self.write_demo_rounds(dem, game_times)
            
            return True
        except Exception as e:
            print(f"Error parsing demo: {e}")
            return False

    def read_demo_round(self, round: int):
        try:
            file_path = os.path.join(self.output_dir, f"demo/r_{round}.parquet")
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return []

            df = pl.read_parquet(file_path)
            
            return df.to_dicts()  # Converts to list of dictionaries
        except Exception as e:
            print(f"Error reading file: {e}")
            return []

    def read_demo_round_info(self):
        try:
            file_path = os.path.join(self.output_dir, f"demo/r_info.parquet")
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return []

            df = pl.read_parquet(file_path)
            
            return df.to_dicts()  # Converts to list of dictionaries
        except Exception as e:
            print(f"Error reading file: {e}")
            return []

    def write_demo_rounds(self, dem, game_times):
        try:
            # Define the subdirectory for this demo
            demo_dir = os.path.join(self.output_dir, "demo")
            os.makedirs(demo_dir, exist_ok=True)  # Create it if it doesn't exist

            # Save round info
            df_info = pl.DataFrame(dem.rounds['round_num', 'winner'])
            info_path = os.path.join(demo_dir, "r_info.parquet")
            df_info.write_parquet(info_path)

            # Save tick data per round
            num_rounds = int(dem.rounds['round_num'].max())
            for round_num in range(1, num_rounds + 1):
                round_data = self.parse_demo_round(dem, game_times, round_num)
                if round_data:
                    df_round = pl.DataFrame(round_data)
                    round_path = os.path.join(demo_dir, f"r_{round_num}.parquet")
                    df_round.write_parquet(round_path)

            return True

        except Exception as e:
            print(f"Error writing file: {e}")
            return False

    def parse_demo_round(self, dem, game_times, round_num: int = 1) -> List[Dict[str, Any]]:
        round_info = dem.rounds.filter(pl.col("round_num") == round_num)
        start_tick = round_info[0, "freeze_end"]
        end_tick = round_info[0, "end"]
        tick_list = list(range(start_tick, end_tick + 1, 32))

        player_ticks = dem.ticks.filter(
            (pl.col("round_num") == round_num) & (pl.col("tick").is_in(tick_list))
        ).group_by("tick", maintain_order=True).all()

        grouped_dict = player_ticks.to_dict(as_series=False)
        grouped_dict = {
            tick: {
                "X": grouped_dict["X"][i],
                "Y": grouped_dict["Y"][i],
                "side": grouped_dict["side"][i],
                "health": grouped_dict["health"][i],
                "name": grouped_dict["name"][i],
                "yaw": grouped_dict["yaw"][i],
                "inventory": grouped_dict.get("inventory", [])[i]
            }
            for i, tick in enumerate(grouped_dict["tick"])
        }

        r1_smokes = dem.smokes.filter(pl.col("round_num") == round_num).to_pandas()
        r1_molly = dem.infernos.filter(pl.col("round_num") == round_num).to_pandas()
        active_grenades = dem.grenades.filter(
            (pl.col("round_num") == round_num) & pl.col("X").is_not_null() & pl.col("tick").is_in(tick_list)
        ).to_pandas()

        grenade_by_tick = active_grenades.groupby("tick")[["thrower", "grenade_type", "X", "Y", "entity_id"]].apply(
            lambda x: x.to_dict("records")
        ).to_dict()

        tick_data_list = []

        for tick in tick_list:
            player_row = grouped_dict.get(tick, {
                "name": [], "X": [], "Y": [], "side": [], "health": [], "yaw": [], "inventory": []
            })

            players = []
            for i in range(len(player_row["name"])):
                inv = classify_inventory(player_row["inventory"][i])
                players.append({
                    "name": player_row["name"][i],
                    "X": player_row["X"][i],
                    "Y": player_row["Y"][i],
                    "side": player_row["side"][i],
                    "health": player_row["health"][i],
                    "yaw": player_row["yaw"][i],
                    **inv
                })

            active_smokes = r1_smokes.query(f"{tick} >= start_tick and {tick} <= end_tick")[["X", "Y", "start_tick", "end_tick"]].to_dict("records")
            active_molly = r1_molly.query(f"{tick} >= start_tick and {tick} <= end_tick")[["X", "Y", "start_tick", "end_tick"]].to_dict("records")
            airborne_grenades = grenade_by_tick.get(tick, [])

            tick_game_time = game_times.filter(pl.col('tick') == tick)[0]
            round_start_game_time = game_times.filter(pl.col('tick') == start_tick)[0]
            time = 115 - (tick_game_time['game_time'] - round_start_game_time['game_time'])
            time = format_clock(time[0])

            tick_data_list.append({
                "tick": tick,
                "time": time,
                "players": players,
                "activeSmokes": active_smokes,
                "activeMolly": active_molly,
                "activeGrenades": airborne_grenades,
                "shots": []
            })

        return tick_data_list