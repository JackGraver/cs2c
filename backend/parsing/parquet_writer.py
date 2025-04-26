import os
import shutil
from typing import List
import polars as pl
from awpy import Demo

from parsing.tick_processor import parse_demo_round
from db.queries import add_parsed_demos, remove_parsed_demo

output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../parsed_demos"))

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
    
def read_demo_round(demo_id: str, round: int):
    try:
        file_path = os.path.join(output_dir, f"{demo_id}/r_{round}.parquet")
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return []

        df = pl.read_parquet(file_path)
        return df.to_dicts()  # Converts to list of dictionaries
    except Exception as e:
        print(f"Error reading file: {e}")
        return []

def write_demo_rounds(dem: Demo, demo_id: str, game_times: pl.DataFrame) -> bool:
    if _write_files(dem, demo_id, game_times):
        return add_parsed_demos(dem, demo_id, game_times)
    else:
        return False
    
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

        # Save round info
        # df_info = pl.DataFrame(dem.rounds['round_num', 'winner'])
        info_path = os.path.join(demo_dir, "r_info.parquet")
        df_info.write_parquet(info_path)
        
        # Save tick data per round
        num_rounds = int(dem.rounds['round_num'].max())
        for round_num in range(1, num_rounds + 1):
            round_data = parse_demo_round(dem, game_times, round_num)
            if round_data:
                df_round = pl.DataFrame(round_data)
                round_path = os.path.join(demo_dir, f"r_{round_num}.parquet")
                df_round.write_parquet(round_path)
                
        return True

    except Exception as e:
        print(f"Error writing file: {e}")
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
        
        