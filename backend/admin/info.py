import os
from pathlib import Path

from db.queries import *

PATH = Path(__file__).resolve().parent.parent / "parsed_demos"

# teams, date, tournament, maps
def demos():
    return get_all_known_demos()