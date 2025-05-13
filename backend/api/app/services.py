import os
import subprocess
import json

def run_parser(demo_path: str):
    parser_path = os.path.abspath("demoparser.exe")  # use .exe for Windows
    result = subprocess.run(
        [parser_path, demo_path],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise Exception(f"Parser error: {result.stderr}")
    return json.loads(result.stdout)

# Example usage
run_parser("test.txt")