from pathlib import Path
from typing import List
from v2.models.bomb import BombPlant
from v2.models.in_air_grenade import InAirGrenade
from v2.models.kill import Kill
from v2.models.player import Player
from v2.models.shot import Shot
from v2.models.smoke_molly import SmokeMolly
from v2.models.tick import Tick
import polars as pl
from polars import DataFrame

from v2.exceptions.ParsedFileDoesNotExist import InvalidDemoFileError

def read_demo_round(demo_id: str, round_num: int) -> List[Tick]:
    """Reads a stored demo round from .parquet files and reconstructs a List[Tick]."""
    
    base_dir = Path("v2/parsed_demos") / demo_id / f"round_{round_num}"

    # Check if directory exists and contains .parquet files
    if not base_dir.exists() or not any(base_dir.glob("*.parquet")):
        raise InvalidDemoFileError(demo_id)
    
    # Read all dataframes
    ticks_df = pl.read_parquet(base_dir / "ticks.parquet")
    players_df = pl.read_parquet(base_dir / "players.parquet")
    grenades_df = pl.read_parquet(base_dir / "in_air_grenades.parquet")
    smokes_df = pl.read_parquet(base_dir / "smokes.parquet")
    mollys_df = pl.read_parquet(base_dir / "mollys.parquet")
    shots_df = pl.read_parquet(base_dir / "shots.parquet")
    kills_df = pl.read_parquet(base_dir / "kills.parquet")
    bomb_plants_df = (pl.read_parquet(base_dir / "bomb_plants.parquet")
                      if (base_dir / "bomb_plants.parquet").exists() else pl.DataFrame())

    print(demo_id)

    if bomb_plants_df.is_empty():
        bomb_plant = None
    else:
        bomb_plant = bomb_plants_df.row(0, named=True)

    ticks = []

    for tick_row in ticks_df.iter_rows(named=True):
        tick_id = tick_row['tick']
        
        if bomb_plant and tick_id == bomb_plant['tick']:
            plant = BombPlant(bomb_plant['X'], bomb_plant['Y'])
        else:
            plant = None
        
        def extract(cls, df: DataFrame, tick_id: int) -> list:
            if len(df) == 0 or "tick" not in df.columns:
                return []
            
            filtered_rows = df.filter(pl.col("tick") == tick_id).to_dicts()
            
            instances = []
            for row in filtered_rows:
                row_data = {k: v for k, v in row.items() if k != "tick"}
                instances.append(cls(**row_data))
            
            return instances

        tick = Tick(
            tick=tick_id,
            logical_time=tick_row['logical_time'],
            players=extract(Player, players_df, tick_id),
            in_air_grenades=extract(InAirGrenade, grenades_df, tick_id),
            smokes=extract(SmokeMolly, smokes_df, tick_id),
            mollys=extract(SmokeMolly, mollys_df, tick_id),
            shots=extract(Shot, shots_df, tick_id),
            kills=extract(Kill, kills_df, tick_id),
            bomb_plant = plant
        )
        ticks.append(tick)

    return ticks