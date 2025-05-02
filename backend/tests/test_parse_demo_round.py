import time
from awpy import Demo
from tick_processor import _parse_demo_round, parse_demo_round

import pickle

dem = Demo("../other/liquid-vs-natus-vincere-m1-anubis.dem", verbose=False)
dem.parse(player_props=["health", "armor_value", "yaw", "inventory"])
game_times = dem.parse_ticks(other_props=["game_time", "team_clan_name", 'is_terrorist_timeout', 'is_ct_timeout'])   

def run_test():
    print('Running actual test')
    start = time.perf_counter()
    tick_list = _parse_demo_round(dem, game_times, 3)
    end = time.perf_counter()
    print(f'old version takes {end - start:.3f} seconds')
    
    start = time.perf_counter()
    tick_list2 = parse_demo_round(dem, game_times, 3)
    end = time.perf_counter()
    print(f'new version takes {end - start:.3f} seconds')

    try:
        assert tick_list == tick_list2
        print('✅ Test passed: outputs match!')
    except AssertionError:
        print('❌ Test failed: outputs do not match!')
        raise  # re-raise to still see the traceback if you want
    
if __name__ == "__main__":
    run_test()