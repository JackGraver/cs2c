from dataclasses import dataclass
from typing import List

@dataclass
class Player:
    X: int
    Y: int
    yaw: int
    side: bool
    health: int
    name: int
    inventory: List[int]
    blinded: bool
    has_helmet: bool
    has_defuser: bool
    armor: int