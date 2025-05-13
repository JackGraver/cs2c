from dataclasses import dataclass

@dataclass
class Kill:
    assistedflash: bool
    assister_name: str
    assister_side: str
    attacker_name: str
    attacker_side: str
    attackerblind: bool
    attackerinair: bool
    headshot: bool
    noscope: bool
    penetrated: bool
    thrusmoke: bool
    weapon: str
    user_name: str
    user_side: str