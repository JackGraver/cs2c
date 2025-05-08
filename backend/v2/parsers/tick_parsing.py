from typing import List
from awpy import Demo
import polars as pl
from polars import DataFrame

from v2.models.tick import Tick, tick_builder
from v2.utils.inventory_map import inventory_map
from v2.utils.grenade_map import grenade_map
from v2.utils.not_weapons import not_weapons
from v2.utils.weapon_map import weapon_map

def parse_demo_round(dem: Demo, game_times: DataFrame, round_num: int = 1) -> List[Tick]:
    """
    Parses a round from a given Demo object

    Args:
        dem (Demo): Demo to parse
        game_times (DataFrame): Dictionary for logical times and team names
        round_num (int, optional): Round to parse. Defaults to 1.

    Returns:
        List[Tick]: List of Tick (models/tick.py) dataclass objects for each tick in the round
    """
        
    round_players = get_round_players(dem)
    round_in_air_grenades = get_round_in_air_grenades(dem)
    round_smokes = get_round_smokes(dem, round_num)
    round_mollys = get_round_mollys(dem, round_num)
    round_shots = get_round_shots(dem)
    
    round_info = dem.rounds.filter(pl.col("round_num") == round_num)
    start_tick = round_info[0, "freeze_end"]
    end_tick = round_info[0, "official_end"]
    round_ticks = list(range(start_tick, end_tick + 1, 16))

    tick_list: List[Tick] = []

    for tick in round_ticks:
        curr_tick = tick_builder(tick, "0.00")
        
        tick_players = round_players.filter(pl.col('tick') == tick)
        curr_tick.parse_tick_players(tick_players)
        
        # in_air_grenades: List[InAirGrenade]
        tick_in_air_grenades = round_in_air_grenades.filter(
            (pl.col('tick') == tick) &
            pl.when(pl.col('tick_right').is_not_null())
            .then(pl.col('tick') < pl.col('tick_right'))
            .otherwise(True)
        ).drop('tick_right')
        curr_tick.parse_tick_grenades(tick_in_air_grenades)
        
        # smokes: List[SmokeMolly]
        tick_smokes = round_smokes.filter((tick < pl.col('end_tick')) & (tick > pl.col('start_tick')))['entity_id', 'X', 'Y', 'thrower_side']
        curr_tick.parse_tick_smokes(tick_smokes)
        
        # mollys: List[SmokeMolly]
        tick_mollys = round_mollys.filter((tick < pl.col('end_tick')) & (tick > pl.col('start_tick')))['entity_id', 'X', 'Y', 'thrower_side']
        curr_tick.parse_tick_mollys(tick_mollys)
        
        # shots: List[Shot]
        tick_shots = round_shots.filter(pl.col('tick').is_between(tick - 8, tick + 8))
        curr_tick.parse_tick_shots(tick_shots)
        
        # kills: List[Kill]
        
        # bomb_plant: BombPlant
        
        
        tick_list.append(curr_tick)
    return tick_list


def get_round_players(dem: Demo):
    p = dem.ticks['tick', 'X', 'Y', 'Z', 'side', 'health', 'name', 'yaw', 'inventory',
    'flash_duration', 'has_helmet', 'has_defuser', 'armor']

    p = p.with_columns([
        pl.col('flash_duration').alias('blinded'),
        pl.col('inventory').list.eval(pl.element().replace_strict(inventory_map, default=-1)),
    ]).drop('flash_duration')

    return p.group_by(pl.col('tick'), maintain_order=True).all()

def get_round_in_air_grenades(dem: Demo):
    g = dem.grenades['X', 'Y', 'tick', 'grenade_type', 'entity_id'].filter(pl.col('Y').is_not_null())

    air_grenades = g.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('grenade_type').replace_strict(grenade_map, default=-1).cast(pl.Int8),
    ])

    hed = dem.events['hegrenade_detonate']['entityid', 'tick'].with_columns(
        pl.col('entityid').cast(pl.Int16)
    )

    air_grenades = air_grenades.join(
        hed,
        left_on='entity_id',
        right_on='entityid',
        how='left',
    )
    
    return air_grenades

def get_round_smokes(dem: Demo, round_num: int):
    smokes = dem.smokes['entity_id', 'start_tick', 'end_tick', 'thrower_side', 'X', 'Y', 'round_num'].filter(pl.col('round_num') == round_num).drop('round_num')

    return smokes.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('entity_id').cast(pl.Int16),
        (pl.col('thrower_side') == 'ct')
    ])
    
def get_round_mollys(dem: Demo, round_num: int):
    mollies = dem.infernos['entity_id', 'start_tick', 'end_tick', 'thrower_side', 'X', 'Y', 'round_num'].filter(pl.col('round_num') == round_num).drop('round_num')

    return mollies.with_columns([
        pl.col('X').cast(pl.Int16),
        pl.col('Y').cast(pl.Int16),
        pl.col('entity_id').cast(pl.Int16),
        (pl.col('thrower_side') == 'ct')
    ])

def get_round_shots(dem: Demo):
    s = dem.events['weapon_fire']['tick', 'user_X', 'user_Y', 'user_yaw', 'weapon'].filter(~pl.col('weapon').str.contains("|".join(not_weapons)))

    return (s.with_columns([
        pl.col('user_X').cast(pl.Int16),
        pl.col('user_Y').cast(pl.Int16),
        pl.col('user_yaw').cast(pl.Int16),
        pl.col('weapon').replace_strict(weapon_map, default=-1).cast(pl.Int8),
    ]))
    
    
    
    
    
    