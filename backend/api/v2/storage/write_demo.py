from dataclasses import asdict
from typing import List
from awpy import Demo
import polars as pl
from pathlib import Path

from polars import DataFrame

from v2.models.tick import Tick
from v2.parsers.round_parser import parse_demo_round

def write_demo(demo_id: str, dem: Demo, game_times: DataFrame):
    """Writes all demo rounds to .parquet files
    - Each round stored in
        - demo_id/round_n/

    Args:
        demo_id (str): id of parsed demo
        dem (Demo): parsed demo
        game_times (DataFrame): time and team information for demo
    """
    num_rounds = int(dem.rounds['round_num'].max())
    
    write_round_info(dem, game_times, demo_id)
    write_round(parse_demo_round(dem, game_times, 1), demo_id, 1)
        
    for round in range(2, num_rounds + 1):
        write_round(parse_demo_round(dem, game_times, round), demo_id, round)
    
    
def write_round(round: List[Tick], demo_id: str, round_num: int):
    """Write a given round to necessary parquet files
    - ticks.parquet
    - players.parquet
    - in_air_grenades.parquet
    - smokes.parquet
    - mollys.parquet
    - shots.parquet
    - kills.parquet

    Args:
        round (List[Tick]): 
        demo_id (str): used for folder
        round_num (int): round num to write
    """
    
    base_dir = Path("v2/parsed_demos") / demo_id / f"round_{round_num}"
    base_dir.mkdir(parents=True, exist_ok=True)

    # 2. Collect flat rows for each type
    tick_meta = []
    players_rows = []
    grenades_rows = []
    smokes_rows = []
    mollys_rows = []
    shots_rows = []
    kills_rows = []
    plants_rows = []

    for tick in round:
        # print('writing tick', tick.tick)
        tick_id = tick.tick
        tick_meta.append({"tick": tick_id, "logical_time": tick.logical_time})

        for p in tick.players:
            players_rows.append(asdict(p) | {"tick": tick_id})
        for g in tick.in_air_grenades:
            grenades_rows.append(asdict(g) | {"tick": tick_id})
        for s in tick.smokes:
            smokes_rows.append(asdict(s) | {"tick": tick_id})
        for m in tick.mollys:
            mollys_rows.append(asdict(m) | {"tick": tick_id})
        for sh in tick.shots:
            shots_rows.append(asdict(sh) | {"tick": tick_id})
        for k in tick.kills:
            kills_rows.append(asdict(k) | {"tick": tick_id})
        if tick.bomb_plant:
            plants_rows.append(asdict(tick.bomb_plant) | {"tick": tick_id})

    # 3. Write each group to a Parquet file
    DataFrame(tick_meta).write_parquet(base_dir / "ticks.parquet")
    DataFrame(players_rows).write_parquet(base_dir / "players.parquet")
    DataFrame(grenades_rows).write_parquet(base_dir / "in_air_grenades.parquet")
    DataFrame(smokes_rows).write_parquet(base_dir / "smokes.parquet")
    DataFrame(mollys_rows).write_parquet(base_dir / "mollys.parquet")
    DataFrame(shots_rows).write_parquet(base_dir / "shots.parquet")
    DataFrame(kills_rows).write_parquet(base_dir / "kills.parquet")

    if plants_rows:
        DataFrame(plants_rows).write_parquet(base_dir / "bomb_plants.parquet")
        
        
def write_round_info(dem: Demo, game_times: DataFrame, demo_id: str):
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
    
    team1, team2 = game_times['team_clan_name'].drop_nulls().unique()

    df_info = df_info.with_columns([
        pl.lit(team1).alias('team1'),
        pl.lit(team2).alias('team2'),
    ])
            
    # Save round info
    # df_info = DataFrame(dem.rounds['round_num', 'winner'])
    base_dir = Path("v2/parsed_demos") / demo_id
    base_dir.mkdir(parents=True, exist_ok=True)
    df_info.write_parquet(base_dir / "round_info.parquet")
