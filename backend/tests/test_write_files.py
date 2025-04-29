from awpy import Demo
from parsing.parquet_writer import _write_files

dem = Demo("backend/other/liquid-vs-natus-vincere-m1-anubis.dem", verbose=False)
dem.parse(player_props=["health", "armor_value", "yaw", "inventory"])
game_times = dem.parse_ticks(other_props=["game_time", "team_clan_name", 'is_terrorist_timeout', 'is_ct_timeout'])   

def run_test():
    _write_files(dem, "testing", game_times)
    
if __name__ == "__main__":
    run_test()