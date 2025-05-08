from dataclasses import dataclass

@dataclass
class Tick:
    tick: int
    logical_time: str
    players: List[players]