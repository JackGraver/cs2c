from typing import Tuple
import uuid
from awpy import Demo
from polars import DataFrame

def parse_demo(file_path: bytes) -> Tuple[str, Demo, DataFrame]:
    try:
        dem = Demo(file_path, verbose=False)
        dem.parse(player_props=["health", "armor_value", "yaw", "inventory", 'flash_duration', "has_helmet", "has_defuser"])
        game_times = dem.parse_ticks(other_props=["game_time", "team_clan_name", 'is_terrorist_timeout', 'is_ct_timeout'])
        
        demo_id = str(uuid.uuid4())
        
        return demo_id, dem, game_times
    except Exception as e:
        print(f"Error parsing demo: {e}")
        return None