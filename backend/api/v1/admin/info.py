import os
from pathlib import Path

from v1.db.queries import *

PATH = Path(__file__).resolve().parent.parent / "parsed_demos"

def storage():
    storage_summary = {}

    for subdir in PATH.iterdir():
        if subdir.is_dir():
            num_files = 0
            size_in_bytes = 0

            # Recursively walk through subdir
            for file in subdir.rglob("*"):
                if file.is_file():
                    num_files += 1
                    size_in_bytes += file.stat().st_size

            storage_summary[subdir.name] = {
                "num_files": num_files - 1,
                "size": size_in_bytes / 1_000_000
            }

    return storage_summary

# teams, date, tournament, maps
def demos():
    return get_all_known_demos()