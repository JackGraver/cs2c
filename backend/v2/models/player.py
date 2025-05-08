from dataclasses import dataclass

@dataclass
class Player:
    X: int
    Y: int
    yaw: int
    side: int
    health: int
    name: int
    inventory: [int]
    flash_duration: int
    has_helmet: bool
    has_defuser: bool
    armor: int
    