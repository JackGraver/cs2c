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

def read_demo_round(demo_id: str, round_num: int) -> List[Tick]:
    """Reads a stored demo round from .parquet files and reconstructs a List[Tick]."""
    print('f')
    base_dir = Path("v2/parsed_demos") / demo_id / f"round_{round_num}"

    
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
        
        def extract(cls, df):
            return [cls(**{k: v for k, v in row.items() if k != "tick"})
                    for row in df.filter(pl.col("tick") == tick_id).to_dicts()]

        tick = Tick(
            tick=tick_id,
            logical_time=tick_row['logical_time'],
            players=extract(Player, players_df),
            in_air_grenades=extract(InAirGrenade, grenades_df),
            smokes=extract(SmokeMolly, smokes_df),
            mollys=extract(SmokeMolly, mollys_df),
            shots=extract(Shot, shots_df),
            kills=extract(Kill, kills_df),
            bomb_plant = plant
        )
        ticks.append(tick)

    return ticks