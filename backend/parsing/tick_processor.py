from typing import Any, Dict, List
import polars as pl
from awpy import Demo

SECONDARIES = {"USP-S", "Glock-18", "P250", "Five-SeveN", "Dual Berettas", "Tec-9", "Desert Eagle"}
PRIMARIES = {"AK-47", "M4A1-S", "AWP", "FAMAS", "Galil AR"}
GRENADES = {"Flashbang", "Smoke Grenade", "Molotov", "High Explosive Grenade", "Decoy", "Incendiary Grenade"}

def _classify_inventory(items: List[str]) -> Dict[str, Any]:
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

def _format_clock(seconds: float) -> str:
    m = int(seconds) // 60
    s = int(seconds) % 60
    return f"{m}:{s:02}"


# get:
# What information you need (fields/data you care about)

# Where they are currently (which dataframe, dictionary, etc.)

# How they relate to each other (if you know — like tick-based, player-based, event-based, etc.)


# maybe helps:
# Start with a clear "core" data structure (per round? per tick? per player?)

# Attach extra info cleanly (like kill feeds, grenades, utility events)

# Keep it easy to slice for frontend playback (example: "give me tick X info immediately" should be fast)


# ex
# From tick_df:
# - player positions
# - player velocity
# - player health

# From kill_feed:
# - kill events (time, attacker, victim, weapon)

# From grenades_dict:
# - active smokes
# - molotov positions


# Data I need

# Per Tick Information 
# - tick #
# - physical round time
# - player locations
# --name
# --X
# --y
# --yaw
# --health
# --side
# --team_name
# --inventory
# ---secondary
# ---primary
# ---grenades[]
# -in air grenades
# --x
# --y
# --id
# --type
# --thrower
# -active smokes & molly (same)
# --x
# --y
# --start_tick
# --end_tick
# --id
# -shots
# --id
# --x
# --y
# --yaw
# --weapon
# -bomb_plant
# --x
# --y
# -kills
# --assistedflash
# --assister_name
# --assister_side
# --attacker_name
# --attacker_side
# --attackerblind
# --attackerinair
# --headshot
# --noscope
# --penetrated
# --thrusmoke
# --weapon
# --user_name
# --user_side



# - tick # - dem.ticks
# - physical round time - game_times
# - player locations - dem.ticks
# - in air grenades - dem.grenades
# - bomb_plant - dem.events
# - kills - dem.events


# data sources

# game_times (dem.parse_ticks(other_props=["game_time", "team_clan_name", 'is_terrorist_timeout', 'is_ct_timeout']))

# dem.rounds (dataframe)
# - start_tick
# - end_tick
# -- calculates tick_list

# dem.events (dictionary)
# - bomb_plant, columns ['tick', 'user_X', 'user_Y']
# - he_detonates, columns ['entityid', 'tick']
# - r_shots, columns ['tick', 'user_X', 'user_Y', 'user_yaw', 'weapon']
# - r_kills, columns ['tick', 'assistedflash', 'assister_name', 'assister_side', 'attacker_name', 'attacker_side', 'attackerblind', 'attackerinair', 'headshot', 'noscope', 'penetrated', 'thrusmoke', 'weapon', 'user_name', 'user_side']

# dem.ticks (dataframe)
# - player_ticks

# dem.smokes (dataframe)
# - r_smokes
 
# dem.infernos (dataframe)
# - r_molly

# dem.grenades (dataframe)
# - grenades
inventory_map = {
    "M9 Bayonet": 1,
    "Butterfly Knife": 2,
    "Karambit": 3,

    
    "USP-S": 4, 
    "P2000": 5,
    "Glock-18": 6,
    "P250": 7, 
    "Dual Berettas": 8,
    "Five-SeveN": 9,
    "Tec-9": 10,
    "Desert Eagle": 11,

        
    "MAC-10": 12,
    "MP9": 13,
    
    
    "AK-47": 14, 
    "Galil AR": 15,
    "M4A1-S": 16,
    "M4A4": 17,
    "FAMAS": 18,
    "AWP": 19,
    "SSG 08": 20,
    
    
    "High Explosive Grenade": 21,
    "Incendiary Grenade": 22,
    "Flashbang": 23,
    "Molotov": 24,
    "Smoke Grenade": 25,
    
    "C4 Explosive": 26,
}

grenade_map = {
    "CFlashbangProjectile": 1,
    "CSmokeGrenadeProjectile": 2,
    "CMolotovProjectile": 3,
    "CHEGrenadeProjectile": 4,
} 

not_weapons = ['knife', 'flashbang', 'smokegrenade']

weapon_map = {
    "M9 Bayonet": 1,
    "Butterfly Knife": 2,
    "Karambit": 3,

    
    "weapon_usp_silencer": 4, 
    "P2000": 5,
    "weapon_glock": 6,
    "weapon_p250": 7, 
    "Dual Berettas": 8,
    "weapon_fiveseven": 9,
    "weapon_tec9": 10,
    "weapon_deagle": 11,

        
    "weapon_mac10": 12,
    "weapon_mp9": 13,
    
    
    "weapon_ak47": 14, 
    "weapon_galilar": 15,
    "weapon_m4a1_silencer": 16,
    "weapon_m4a1": 17,
    "weapon_famas": 18,
    "weapon_awp": 19,
    "weapon_ssg08": 20,
    
    
    "weapon_hegrenade": 21,
    "weapon_incgrenade": 22,
    "Flashbang": 23,
    "weapon_molotov": 24,
    "Smoke Grenade": 25,
    
    "C4 Explosive": 26,
}


def parse_demo_round(dem: Demo, game_times: pl.DataFrame, round_num: int = 1) -> List[Dict[str, Any]]:
    p = dem.ticks['tick', 'X', 'Y', 'side', 'health', 'name', 'yaw', 'inventory']

    p = p.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('health').cast(pl.UInt8),
        pl.col('yaw').cast(pl.Int16),
        pl.col('inventory').list.eval(pl.element().replace_strict(inventory_map, default=-1)),
        (pl.col('side') == 'ct')
    ])

    grouped_players = p.group_by(pl.col('tick'), maintain_order=True).all()
    
    teams = game_times['team_clan_name', 'name'].unique(subset=['team_clan_name'])
    
    g = dem.grenades['X', 'Y', 'tick', 'grenade_type'].filter(pl.col('Y').is_not_null())

    air_grenades = g.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('grenade_type').replace_strict(grenade_map, default=-1).cast(pl.Int8),
    ])

    b = dem.events['bomb_planted']['user_X', 'user_Y', 'tick']

    plant = (b.with_columns([
        pl.col('user_X').cast(pl.Int16).alias('X'),
        pl.col('user_Y').cast(pl.Int16).alias('Y'),
    ]).drop(['user_X', 'user_Y']))


    s = dem.events['weapon_fire']['tick', 'user_X', 'user_Y', 'user_yaw', 'weapon'].filter(~pl.col('weapon').str.contains("|".join(not_weapons)))

    shots = (s.with_columns([
        pl.col('user_X').cast(pl.Int16).alias('X'),
        pl.col('user_Y').cast(pl.Int16).alias('Y'),
        pl.col('user_yaw').cast(pl.Int16).alias('yaw'),
        pl.col('weapon').replace_strict(weapon_map, default=-1).cast(pl.Int8),
    ]).drop(['user_X', 'user_Y', 'user_yaw']))


    pd = dem.events['player_death']['tick', 'assistedflash', 'assister_name', 'assister_side', 'attacker_name', 'attacker_side', 'attackerblind', 'attackerinair', 'headshot', 'noscope', 'penetrated', 'thrusmoke', 'weapon', 'user_name', 'user_side']

    kills = pd.with_columns([
        pl.when(pl.col('assister_side') == 'ct')
            .then(1)
            .when(pl.col('assister_side') == 't')
            .then(0)
            .otherwise(-1)
            .cast(pl.Int8)
            .alias('assister_side'),
        pl.when(pl.col('assister_name').is_null())
            .then(pl.lit('N/A'))
            .otherwise(pl.col('assister_name'))
            .alias('assister_name'),
        (pl.col('attacker_side') == 'ct').alias('attacker_side_ct'),
        (pl.col('user_side') == 'ct').alias('user_side_ct'),
        (pl.col('penetrated') == 1).alias('penetrated'),
        pl.col('weapon').replace_strict(weapon_map, default=-1).cast(pl.Int8),
    ])

    # hed = dem.events['hegrenade_detonate']['entityid', 'tick'].with_columns(
    #     pl.col('entityid').cast(pl.Int16)
    # )

    smokes = dem.smokes['entity_id', 'start_tick', 'end_tick', 'thrower_side', 'X', 'Y', 'round_num'].filter(pl.col('round_num') == round_num).drop('round_num')

    smokes = smokes.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('entity_id').cast(pl.Int16),
        (pl.col('thrower_side') == 'ct')
    ])

    mollies = dem.infernos['entity_id', 'start_tick', 'end_tick', 'thrower_side', 'X', 'Y', 'round_num'].filter(pl.col('round_num') == round_num).drop('round_num')

    mollies = mollies.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('entity_id').cast(pl.Int16),
        (pl.col('thrower_side') == 'ct')
    ])

    round_info = dem.rounds.filter(pl.col("round_num") == round_num)
    start_tick = round_info[0, "freeze_end"]
    end_tick = round_info[0, "official_end"]
    ticks = list(range(start_tick, end_tick + 1, 16))

    bomb_plant = dem.events['bomb_planted']['tick', 'user_X', 'user_Y'].filter(
        pl.col('tick').is_between(start_tick, end_tick)
    )
    if bomb_plant.height > 0:
        bomb_plant_tick = bomb_plant[0, 'tick']
    else:
        bomb_plant_tick = -1

    tick_list = []

    for tick in ticks:
        try:
            players = grouped_players.row(by_predicate=(pl.col('tick') == tick), named=True)
        except Exception:
            continue

        p = []

        for i in range(len(players["name"])):
            curr = players
            
            try:
                team_name = teams.row(by_predicate=(pl.col('name') == curr['name'][i]))[0]
            except Exception:
                team_name = ""
        
            p.append({
                "name": curr['name'][i],
                "X": curr['X'][i],
                "Y": curr['Y'][i],
                "side": curr['side'][i],
                "health": curr['health'][i],
                "yaw": curr['yaw'][i],
                "team_clan_name": team_name,
                "inventory": curr['inventory'][i]
            })
        
        tick_game_time = game_times.filter(pl.col('tick') == tick)[0]
        round_start_game_time = game_times.filter(pl.col('tick') == start_tick)[0]
        
        tick_time = 0
        if bomb_plant_tick != -1 and tick >= bomb_plant_tick:
            # After bomb planted
            bomb_tick_time = game_times.filter(pl.col('tick') == bomb_plant_tick)[0]
            tick_time = 40 - (tick_game_time['game_time'] - bomb_tick_time['game_time'])
        else:
            # Normal round clock
            tick_time = 115 - (tick_game_time['game_time'] - round_start_game_time['game_time'])
            
        tick_time = _format_clock(tick_time[0])
        
        tick_smokes = smokes.filter((tick < pl.col('end_tick')) & (tick > pl.col('start_tick')))
        tick_smokes = tick_smokes['entity_id', 'X', 'Y', 'thrower_side'].to_dicts()

        tick_mollies = mollies.filter((tick < pl.col('end_tick')) & (tick > pl.col('start_tick')))
        tick_mollies = tick_mollies['entity_id', 'X', 'Y', 'thrower_side'].to_dicts()
        
        airborne_grenades = air_grenades.filter(pl.col('tick') == tick).to_dicts()
        
        tick_shots = shots.filter(pl.col('tick').is_between(tick - 8, tick + 8)).to_dicts()

        tick_kills = kills.filter(pl.col('tick').is_between(tick - 8, tick + 8)).to_dicts()
        
        tick_plant = plant.filter(pl.col('tick').is_between(tick - 8, tick + 8)).to_dicts()
        
        tick_list.append({
            "tick": tick,
            "time": tick_time,
            "players": p,
            "activeSmokes": tick_smokes,
            "activeMolly": tick_mollies,
            "activeGrenades": airborne_grenades,
            "shots": tick_shots,
            "kills": tick_kills,
            "bomb_plant": tick_plant
        })
        
    return tick_list



def _parse_demo_round(dem: Demo, game_times: pl.DataFrame, round_num: int = 1) -> List[Dict[str, Any]]:
    round_info = dem.rounds.filter(pl.col("round_num") == round_num)
    start_tick = round_info[0, "freeze_end"]
    end_tick = round_info[0, "official_end"]
    tick_list = list(range(start_tick, end_tick + 1, 16))

    bomb_plant = dem.events['bomb_planted']['tick', 'user_X', 'user_Y'].filter(
        pl.col('tick').is_between(start_tick, end_tick)
    )
    if bomb_plant.height > 0:
        bomb_plant_tick = bomb_plant[0, 'tick']
    else:
        bomb_plant_tick = -1

    player_ticks = dem.ticks.filter(
        (pl.col("round_num") == round_num) & (pl.col("tick").is_in(tick_list))
    ).group_by("tick", maintain_order=True).all()

    steamid_to_team = {
        row["steamid"]: row["team_clan_name"]
        for row in game_times.to_dicts()
    }

    grouped_dict = player_ticks.to_dict(as_series=False)
    grouped_dict = {
        tick: {
            "X": grouped_dict["X"][i],
            "Y": grouped_dict["Y"][i],
            "side": grouped_dict["side"][i],
            "health": grouped_dict["health"][i],
            "name": grouped_dict["name"][i],
            "yaw": grouped_dict["yaw"][i],
            "inventory": grouped_dict.get("inventory", [])[i],
            "team_clan_name": [
                steamid_to_team.get(sid) for sid in grouped_dict["steamid"][i]
            ]
        }
        for i, tick in enumerate(grouped_dict["tick"])
    }

    r_smokes = dem.smokes.filter(pl.col("round_num") == round_num).to_pandas()
    r_molly = dem.infernos.filter(pl.col("round_num") == round_num).to_pandas()
    
    he_detonates = dem.events['hegrenade_detonate'].select(['entityid', 'tick']).rename({'tick': 'detonate_tick'})
    he_detonates = he_detonates.unique(subset=["entityid"])
    grenades = dem.grenades.filter(pl.col("X").is_not_null())
    
    grenades_with_detonate = grenades.join(
        he_detonates,
        left_on='entity_id',
        right_on='entityid',
        how='left'
    )
        
    active_grenades = grenades_with_detonate.filter(
        (pl.col("round_num") == round_num) &
        pl.col("X").is_not_null() &
        pl.col("tick").is_in(tick_list) &
        pl.when(pl.col("grenade_type") == "CHEGrenadeProjectile")
        .then(pl.col("tick") < pl.col("detonate_tick"))
        .otherwise(True)
    ).to_pandas()
    
    not_weapons = ['knife', 'flashbang', 'smokegrenade']
    r_shots = dem.events['weapon_fire']['tick', 'user_X', 'user_Y', 'user_yaw', 'weapon'].filter(pl.col('tick') < end_tick).filter(~pl.col('weapon').str.contains("|".join(not_weapons)))
    r_shots = r_shots.with_columns(pl.arange(1, r_shots.height + 1).alias('shot_id'))
    r_shots = r_shots.to_pandas()

    r_kills = dem.events['player_death']['tick', 'assistedflash', 'assister_name', 'assister_side', 'attacker_name', 'attacker_side', 'attackerblind', 'attackerinair', 'headshot', 'noscope', 'penetrated', 'thrusmoke', 'weapon', 'user_name', 'user_side']
    r_kills = r_kills.filter(pl.col('tick').is_between(start_tick, end_tick)).to_pandas()

    grenade_by_tick = active_grenades.groupby("tick")[["thrower", "grenade_type", "X", "Y", "entity_id"]].apply(
        lambda x: x.to_dict("records")
    ).to_dict()

    tick_data_list = []

    for tick in tick_list:

        player_row = grouped_dict.get(tick, {
            "name": [], "X": [], "Y": [], "side": [], "team_clan_name": [], "health": [], "yaw": [], "inventory": []
        })

        players = []
        for i in range(len(player_row["name"])):
            inv = _classify_inventory(player_row["inventory"][i])
            players.append({
                "name": player_row["name"][i],
                "X": player_row["X"][i],
                "Y": player_row["Y"][i],
                "side": player_row["side"][i],
                "health": player_row["health"][i],
                "yaw": player_row["yaw"][i],
                "team_name": player_row['team_clan_name'][i],
                **inv
            })

        active_smokes = r_smokes.query(f"{tick} >= start_tick and {tick} <= end_tick")[["X", "Y", "start_tick", "end_tick", "entity_id"]].to_dict("records")
        active_molly = r_molly.query(f"{tick} >= start_tick and {tick} <= end_tick")[["X", "Y", "start_tick", "end_tick", "entity_id"]].to_dict("records")
        airborne_grenades = grenade_by_tick.get(tick, [])
        
        shots = r_shots.query(f"{tick - 8} <= tick and {tick + 8} >= tick").to_dict("records")

        kills = r_kills[(r_kills['tick'] >= tick - 8) & (r_kills['tick'] <= tick + 8)].to_dict("records")

        for kill in kills:
            # If assister_name is None, replace it with 'N/A' or leave it as None
            kill['assister_name'] = kill.get('assister_name') or 'N/A'
            kill['assister_side'] = kill.get('assister_side') or 'N/A'
            kill['attacker_name'] = kill.get('attacker_name') or 'N/A'
            kill['attacker_side'] = kill.get('attacker_side') or 'N/A'

        tick_game_time = game_times.filter(pl.col('tick') == tick)[0]
        round_start_game_time = game_times.filter(pl.col('tick') == start_tick)[0]

        time = 0
        if bomb_plant_tick != -1 and tick >= bomb_plant_tick:
            # After bomb planted
            bomb_tick_time = game_times.filter(pl.col('tick') == bomb_plant_tick)[0]
            time = 40 - (tick_game_time['game_time'] - bomb_tick_time['game_time'])
        else:
            # Normal round clock
            time = 115 - (tick_game_time['game_time'] - round_start_game_time['game_time'])
            
        time = _format_clock(time[0])

        if bomb_plant.height > 0 and abs(tick - bomb_plant_tick) <= 8:
            first_bomb_plant = bomb_plant.to_pandas().to_dict('records')
        else:
            # Set a default empty dictionary if no bomb plant data
            first_bomb_plant = []

        try:
            tick_data_list.append({
                "tick": tick,
                "time": time,
                "players": players,
                "activeSmokes": active_smokes,
                "activeMolly": active_molly,
                "activeGrenades": airborne_grenades,
                "shots": shots,
                "kills": kills,
                "bomb_plant": first_bomb_plant
            })
        except Exception as e:
            print(f"Error serializing at tick {tick}: {e}")
            raise

    return tick_data_list