from fastapi import File, UploadFile
from typing import List

from v2.models.tick import Tick
from v2.parsers.demo_parser import parse_demo
from v2.storage.write_demo import write_demo

def parse(file: UploadFile = File(...)) -> List[Tick]:
    """Parses a provided .dem file
    - Saves the result to .parquet files
    - Updates database with new parsed demo
    
    Args:
        file (UploadFile, optional): .dem file to be parsed. Defaults to File(...).

    Returns:
        List[Tick]: Returns the the Tick information for the first round of the demo
    """
    
    try:
        demo_id, dem, game_times = parse_demo('v2/testing/mouz-vs-pain-m1-nuke.dem')
    except Exception:
        print('had exception in parse_demo')
        
    write_demo(demo_id, dem, game_times)
        
    # update database