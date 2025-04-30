import os
import shutil
import traceback
from typing import List
import polars as pl
from awpy import Demo

from parsing.tick_processor import parse_demo_round
from db.queries import add_parsed_demos, remove_parsed_demo

output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../parsed_demos"))

inventory_map = {
    1: "M9 Bayonet",
    2: "Butterfly Knife",
    3: "Karambit",
    4: "USP-S",
    5: "P2000",
    6: "Glock-18",
    7: "P250",
    8: "Dual Berettas",
    9: "Five-SeveN",
    10: "Tec-9",
    11: "Desert Eagle",
    12: "MAC-10",
    13: "MP9",
    14: "AK-47",
    15: "Galil AR",
    16: "M4A1-S",
    17: "M4A4",
    18: "FAMAS",
    19: "AWP",
    20: "SSG 08",
    21: "High Explosive Grenade",
    22: "Incendiary Grenade",
    23: "Flashbang",
    24: "Molotov",
    25: "Smoke Grenade",
    26: "C4 Explosive"
}

def read_demo_round_info(demo_id: str) -> List:
    try:
        file_path = os.path.join(output_dir, f"{demo_id}/r_info.parquet")
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return []

        df = pl.read_parquet(file_path)
        
        return df.to_dicts()  # Converts to list of dictionaries
    except Exception as e:
        print(f"Error reading file: {e}")
        return []
    
def convert_inventory(player_list):
    return [
        {
            **player,
            "inventory": [inventory_map.get(item, "Unknown") for item in player["inventory"]]
        }
        for player in player_list
    ]    
    
def read_demo_round(demo_id: str, round: int):
    try:
        file_path = os.path.join(output_dir, f"{demo_id}/r_{round}.parquet")
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return []

        df = pl.read_parquet(file_path)

        # print(df["players"][0])

        # df = df.with_columns(
        #     pl.col("players").map_elements(convert_inventory)
        # )
        
        # print(df["players"]) 
        
        return df.to_dicts()  # Converts to list of dictionaries
    except Exception as e:
        print(f"Error reading file: {e}")
        return []

def write_demo_rounds(dem: Demo, demo_id: str, game_times: pl.DataFrame, series_id: str = "") -> bool:
    if _write_files(dem, demo_id, game_times):
        return add_parsed_demos(dem, demo_id, game_times, series_id)
    else:
        return False
    
def print_data_types(round_data):
    for i, round in enumerate(round_data):
        print(f"Round {i + 1}:")
        for key, value in round.items():
            print(f"  {key}: {type(value)}")
            if isinstance(value, list):
                print(f"    List length: {len(value)}")
                for j, item in enumerate(value[:3]):  # sample first 3 items
                    print(f"    [{j}] {type(item)}")
                    if isinstance(item, dict):
                        for k, v in item.items():
                            print(f"      {k}: {type(v)}")
                            if isinstance(v, list):
                                print(f"        {k} is a list of length {len(v)}")
                                for b, inner in enumerate(v[:3]):
                                    print(f"        [{b}] {type(inner)}")
                                    if isinstance(inner, dict):
                                        for ik, iv in inner.items():
                                            print(f"          {ik}: {type(iv)}")
            elif isinstance(value, dict):
                print("    Struct fields:")
                for k, v in value.items():
                    print(f"      {k}: {type(v)}")
                    
from collections import defaultdict

def analyze_struct_list_field(struct_list, path="root") -> dict:
    field_types = defaultdict(set)
    for i, item in enumerate(struct_list):
        if isinstance(item, dict):
            for k, v in item.items():
                field_types[k].add(type(v))
                if isinstance(v, list):
                    nested_types = {type(n) for n in v}
                    field_types[f"{k}[]"] |= nested_types
        elif item is None:
            field_types[path].add(type(item))
        else:
            field_types[path].add(type(item))
    return field_types

def deep_type_check(round_data: list[dict]):
    print("=== Deep Type Inspection ===")
    seen = defaultdict(set)

    for i, row in enumerate(round_data):
        for key, value in row.items():
            if isinstance(value, list) and len(value) > 0:
                # Check deeper types if it's a list of dicts
                inner_types = set(type(x) for x in value)
                seen[key] |= inner_types
                if dict in inner_types:
                    nested_types = analyze_struct_list_field(value, path=key)
                    for subkey, subtypes in nested_types.items():
                        seen[f"{key}.{subkey}"] |= subtypes
            else:
                seen[key].add(type(value))

    for k, typeset in seen.items():
        print(f"{k}: {[t.__name__ for t in typeset]}")

    
def _write_files(dem: Demo, demo_id: str, game_times: pl.DataFrame) -> bool:
    try:
        # Define the subdirectory for this demo
        demo_dir = os.path.join(output_dir, demo_id)
        os.makedirs(demo_dir, exist_ok=True)  # Create it if it doesn't exist

        timeout_ticks = game_times.filter(pl.col('is_ct_timeout') == True).filter(pl.col("is_ct_timeout")).select("tick")
 
        round_info = dem.rounds['round_num', 'start', 'freeze_end', 'winner']

        df_info = round_info.with_columns([
            pl.struct(["start", "freeze_end"]).map_elements(
                lambda r: any(
                    (r["start"] <= t) and (t <= r["freeze_end"])
                    for t in timeout_ticks["tick"].to_list()
                ),
                return_dtype=pl.Boolean
            ).alias("had_timeout")
        ])
        
        df = (dem.rounds['round_num', 'winner'].with_columns([
                pl.when(pl.col("winner") == "ct").then(1).otherwise(0).alias("ct_wins"),
                pl.when(pl.col("winner") == "t").then(1).otherwise(0).alias("t_wins")
            ])
            .with_columns([
                pl.col("ct_wins").cum_sum().alias("ct_wins_cumsum"),
                pl.col("t_wins").cum_sum().alias("t_wins_cumsum")
            ])
        )

        # Shift the cumulative columns by 1 to get "wins during the round"
        df = df.with_columns([
            pl.col("ct_wins_cumsum").shift(1).fill_null(0).alias("ct_wins_during_round"),
            pl.col("t_wins_cumsum").shift(1).fill_null(0).alias("t_wins_during_round")
        ])

        # Select relevant columns and display the result
        df = df.select([
            "round_num",
            "ct_wins_during_round",
            "t_wins_during_round"
        ])
        
        df_info = df_info.join(df, on="round_num", how="full")
        
        team1, team2 = game_times['team_clan_name'].unique()

        df_info = df_info.with_columns([
            pl.lit(team1).alias('team1'),
            pl.lit(team2).alias('team2'),
        ])
                
        # Save round info
        # df_info = pl.DataFrame(dem.rounds['round_num', 'winner'])
        info_path = os.path.join(demo_dir, "r_info.parquet")
        df_info.write_parquet(info_path)
        
        # Save tick data per round
        num_rounds = int(dem.rounds['round_num'].max())
        for round_num in range(1, num_rounds + 1):
            round_data = parse_demo_round(dem, game_times, round_num)
            if round_data:
                deep_type_check(round_data)
                df_round = pl.DataFrame(round_data)
                # print(df_round)
                round_path = os.path.join(demo_dir, f"r_{round_num}.parquet")
                df_round.write_parquet(round_path)
                
        return True

    except Exception as e:
        print(f"Error writing file: {e}")
        traceback.print_exc()
        return False

def delete_demo_rounds(demo_id: str):
    if _delete_files(demo_id):
        return remove_parsed_demo(demo_id)
    else:
        return False

def _delete_files(demo_id: str) -> bool:
    try:
        # Path to the demo subdirectory
        demo_dir = os.path.join(output_dir, demo_id)
        # Delete the directory and all its contents if it exists
        if os.path.exists(demo_dir):
            shutil.rmtree(demo_dir)
            # Check if the directory still exists after deletion
            if os.path.exists(demo_dir):
                return False  # Failed to delete
        else:
            return True  # Directory doesn't exist
        
        # Optionally remove the original .dem file (if stored separately)
        demo_file_path = os.path.join(output_dir, f"{demo_id}.dem")
        if os.path.exists(demo_file_path):
            os.remove(demo_file_path)
            # Check if the .dem file still exists after deletion
            if os.path.exists(demo_file_path):
                return False  # Failed to delete .dem file
        else:
            return True  # .dem file doesn't exist

        return True  # All deletions were successful
    except Exception as e:
        print(f"Error deleting files: {e}")
        return False
        
def cleanup_failed_upload():
    print("FINISH THIS :D")