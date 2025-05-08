from typing import Tuple
import uuid
from awpy import Demo
from polars import DataFrame

def parse_demo(file_path: bytes) -> Tuple[str, Demo, DataFrame]:
    """Parses a given .dem file

    Args:
        file_path (bytes): path to .dem file

    Returns:
        Tuple[str, Demo, DataFrame]: 
            demo_id - UUID4 id
            dem - awpy.Demo
            game_times - awpy.Demo Dataframe for logical time and team names
    """

    if not file_path.lower().endswith(".dem"):
        raise ValueError("Invalid file type: Only .dem files are supported.")
    
    try:
        dem = Demo(file_path, verbose=False)
        dem.parse(player_props=["health", "armor_value", "yaw", "inventory", 'flash_duration', "has_helmet", "has_defuser"])
        game_times = dem.parse_ticks(other_props=["game_time", "team_clan_name", 'is_terrorist_timeout', 'is_ct_timeout'])
        
        demo_id = str(uuid.uuid4())
        
        return demo_id, dem, game_times
    except Exception as e:
        raise RuntimeError(f"Error parsing demo: {e}") from e 