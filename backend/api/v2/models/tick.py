from dataclasses import dataclass
from typing import List, Dict

from polars import DataFrame

from v2.models.bomb import BombPlant
from v2.models.in_air_grenade import InAirGrenade
from v2.models.kill import Kill
from v2.models.player import Player
from v2.models.shot import Shot
from v2.models.smoke_molly import SmokeMolly

def tick_builder(tick: int, time: str):
    return Tick(tick, 
                logical_time=time, 
                players=[], 
                in_air_grenades=[], 
                smokes=[], 
                mollys=[], 
                shots=[], 
                kills=[],
                bomb_plant=None)

@dataclass
class Tick:
    tick: int
    logical_time: str
    players: List[Player]
    in_air_grenades: List[InAirGrenade]
    smokes: List[SmokeMolly]
    mollys: List[SmokeMolly]
    shots: List[Shot]
    kills: List[Kill]
    bomb_plant: BombPlant
    
    def parse_tick_players(self, players: DataFrame):
        for row in players.iter_rows(named=True):
            for i in range(0, len(row['name'])):
                curr_player = Player(
                    row['X'][i],
                    row['Y'][i],
                    row['Z'][i],
                    row['yaw'][i],
                    row['side'][i] == 'ct',
                    row['health'][i],
                    row['name'][i],
                    "temp",
                    row['inventory'][i],
                    row['blinded'][i],
                    row['has_helmet'][i],
                    row['has_defuser'][i],
                    row['armor'][i],
                )
                self.players.append(curr_player)
            
    def parse_tick_grenades(self, grenades: DataFrame):
        for row in grenades.iter_rows(named=True):
            curr_grenade = InAirGrenade(
                row['X'],
                row['Y'],
                row['grenade_type'],
                row['entity_id']
            )
            self.in_air_grenades.append(curr_grenade)
            
    def parse_tick_smokes(self, smokes: DataFrame):
        for row in smokes.iter_rows(named=True):
            curr_smoke = SmokeMolly(
                row['X'],
                row['Y'],
                # row['start_tick'],
                # row['end_tick'],
                row['thrower_side'],
                row['entity_id']
            )
            self.smokes.append(curr_smoke)
            
    def parse_tick_mollys(self, mollys: DataFrame):
        for row in mollys.iter_rows(named=True):
            curr_molly = SmokeMolly(
                row['X'],
                row['Y'],
                # row['start_tick'],
                # row['end_tick'],
                row['thrower_side'],
                row['entity_id']
            )
            self.mollys.append(curr_molly)
            
    def parse_tick_shots(self, shots: DataFrame):
        for row in shots.iter_rows(named=True):
            curr_shot = Shot(
                row['user_X'],
                row['user_Y'],
                row['user_yaw'],
                weapon=row['weapon']
            )
            self.shots.append(curr_shot)
            
    def parse_tick_kills(self, kills: DataFrame):
        for row in kills.iter_rows(named=True):
            curr_kill = Kill(
                assistedflash=row['assistedflash'],
                assister_name=row['assister_name'],
                assister_side=row['assister_side'],
                attacker_name=row['attacker_name'],
                attacker_side=row['attacker_side'],
                attackerblind=row['attackerblind'],
                attackerinair=row['attackerinair'],
                headshot=row['headshot'],
                noscope=row['noscope'],
                penetrated=row['penetrated'],
                thrusmoke=row['thrusmoke'],
                weapon=row['weapon'],
                user_name=row['user_name'],
                user_side=row['user_side']
            )
            self.kills.append(curr_kill)

    def set_plant(self, plant: DataFrame):
        if not plant.is_empty():
            plant = plant.row(0, named=True)
            self.bomb_plant = BombPlant(plant['X'], plant['Y'])