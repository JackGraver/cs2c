import uuid
from awpy import Demo

def parse_demo(file_path: bytes) -> str | None:
        try:
            dem = Demo(file_path, verbose=False)
            dem.parse(player_props=["health", "armor_value", "yaw", "inventory"])
            game_times = dem.parse_ticks(other_props=["game_time", "team_clan_name"])
            
            demo_id = str(uuid.uuid4())
            
            return demo_id, dem, game_times
            
            
            
            # # self.write_demo_rounds(dem, demo_id, game_times)
            # # self.add_parsed_demos(dem, demo_id, game_times)
            
            # return demo_id
        except Exception as e:
            print(f"Error parsing demo: {e}")
            return None