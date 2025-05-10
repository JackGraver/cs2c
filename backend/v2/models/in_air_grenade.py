from dataclasses import dataclass

@dataclass
class InAirGrenade:
    X: int
    Y: int
    type: int
    entity_id: int