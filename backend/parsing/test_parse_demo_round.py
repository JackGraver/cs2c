from awpy import Demo
from tick_processor import parse_demo_round

dem = Demo("liquid-vs-natus-vincere-m1-anubis.dem", verbose=False)
dem.parse(player_props=["health", "armor_value", "yaw", "inventory"])
game_times = dem.parse_ticks(other_props=["game_time", "team_clan_name", 'is_terrorist_timeout', 'is_ct_timeout'])   

def run_test():
    tick_list = parse_demo_round(dem, game_times, 3)
    
    # CHEGrenadeProjectile
    for i in range(len(tick_list)):
        if(tick_list[i]['tick'] > 17000 and tick_list[i]['tick'] < 18000):
            print(tick_list[i]['tick'], '\n', tick_list[i]['activeGrenades'])
    
if __name__ == "__main__":
    run_test()