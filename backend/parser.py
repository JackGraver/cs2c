import datetime
import os
import shutil
import sqlite3
from typing import List, Dict, Any
import uuid
import polars as pl
from awpy import Demo  # or from awpy.parser import Demo depending on your version
 
class Parser:
    def __init__(self):
        self.output_dir = "parsed_demos"

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)