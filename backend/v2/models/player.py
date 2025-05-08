from dataclasses import dataclass
from typing import List

@dataclass
class Player:
    X: int
    Y: int
    Z: int
    yaw: int
    is_ct: bool
    health: int
    name: int
    team_clan_name: str
    inventory: List[int]
    blinded: bool
    has_helmet: bool
    has_defuser: bool
    armor: int