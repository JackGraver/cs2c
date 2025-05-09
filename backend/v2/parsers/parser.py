import tempfile
import traceback
from awpy import Demo
from fastapi import File, UploadFile
from typing import Tuple

from v2.models.tick import Tick
from v2.parsers.demo_parser import parse_demo
from v2.storage.write_demo import write_demo
from v2.db.queries import add_parsed_demos


def parse(file: UploadFile = File(...)) -> Tuple[Demo, str]:
    """Parses a provided .dem file
    - Saves the result to .parquet files
    - Updates database with new parsed demo
    
    Args:
        file (UploadFile, optional): .dem file to be parsed. Defaults to File(...).

    Returns:
        Tuple[Demo, str]: Returns the the parsed Demo and its id
    """
    
    try:
        print('demo', file.filename)
        with tempfile.NamedTemporaryFile(delete=True, suffix=".dem") as temp_file:
            temp_file.write(file.file.read())
            temp_file.flush()  # Ensure all data is written before parsing

            demo_id, dem, game_times = parse_demo(temp_file.name)
        
        write_demo(demo_id, dem, game_times)
        # update database
        add_parsed_demos(dem, demo_id, game_times, "temp_srs")
        
        return dem, demo_id

    except Exception as e:
        print(f'Exception in parse_demo: {e}')
        traceback.print_exc()
        return []
        
