import asyncio
import os
import shutil
import tempfile
import traceback
import uuid
import zipfile
from awpy import Demo
from fastapi import File, UploadFile
from typing import Tuple

from v2.models.tick import Tick
from v2.parsers.demo_parser import parse_demo
from v2.storage.write_demo import write_demo
# from v2.db.queries import add_parsed_demos
from v2.db.insert_demo import insert_parsed_demos


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
        insert_parsed_demos(dem, demo_id, game_times, str(uuid.uuid4()))
        
        return dem, demo_id

    except Exception as e:
        print(f'Exception in parse_demo: {e}')
        traceback.print_exc()
        return []
        

async def parse_zip(file: UploadFile = File(...)) -> Tuple[Demo, str]:
    contents = await file.read()

    first_demo = None
    first_demo_id = None
    
    series_id = str(uuid.uuid4())

    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = f"{tmpdir}/archive.zip"
        with open(zip_path, "wb") as f:
            f.write(contents)

        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            for name in zip_ref.namelist():
                if not name.endswith(".dem"):
                    continue

                with zip_ref.open(name) as dem_file:
                    with tempfile.NamedTemporaryFile(delete=True, suffix=".dem") as temp_file:
                        temp_file.write(dem_file.read())
                        temp_file.flush()

                        print('processing', name)

                        demo_id, dem, game_times = parse_demo(temp_file.name)

                        write_demo(demo_id, dem, game_times)
                        insert_parsed_demos(dem, demo_id, game_times, series_id)

                        if first_demo is None:
                            first_demo = dem
                            first_demo_id = demo_id

    if first_demo is None:
        raise ValueError("No valid .dem files found in the zip.")

    return first_demo, first_demo_id
    







            
def save_temp_file(file: UploadFile) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".dem", mode="wb") as tmp:
        shutil.copyfileobj(file.file, tmp)
        return tmp.name