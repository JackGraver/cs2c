from dataclasses import dataclass

@dataclass
class Shot:
    X: int
    Y: int
    yaw: int
    weapon: str