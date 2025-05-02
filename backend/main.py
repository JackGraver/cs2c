import asyncio
import shutil
from typing import Dict
import uuid
import zipfile
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import traceback

from parsing.demo_parser import parse_demo
from parsing.parquet_writer import *
from admin.info import *
from db.queries import *

# uvicorn main:app --reload --host 127.0.0.1 --port 8000

app = FastAPI()

origins = [
    "http://localhost",
    "http://127.0.0.1",
    "127.0.0.1",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_demos():
    # demos = get_all_known_demos()
    demos = get_all_series()
    return {"demos": demos}
    
@app.get("/demo/{demo_id}/round/{round_num}")
def get_round_data(demo_id: str, round_num: int):
    round = read_demo_round(demo_id, round_num)
    round_info = read_demo_round_info(demo_id)
    series_demos = get_all_series_maps(demo_id)
    if round and round_info:
        return {"data": round, "rounds": round_info, "series_demos": series_demos}
    else:
        raise HTTPException(status_code=400, detail=f"Unable to read round {round_num} from demo {demo_id}.")

@app.post("/init_upload")
async def upload_demo(file: UploadFile = File(...)):
    maps = []
    
    temp_path = await asyncio.to_thread(save_temp_file, file)
    
    try:
        if file.filename.endswith(".zip"):
            with zipfile.ZipFile(temp_path, 'r') as zip_ref:
                with tempfile.TemporaryDirectory() as extract_dir:
                    zip_ref.extractall(extract_dir)

                    for name in zip_ref.namelist():
                        if name.endswith(".dem"):
                            dem_path = os.path.join(extract_dir, name)
                            result = await asyncio.to_thread(init_demo, dem_path)
                            map_name, teams, tournaments = result
        
                            map = {
                                "map": map_name,
                                "team1": teams[0],
                                "team2": teams[1],
                            }
                            
                            maps.append(map)                                                   
        else:
            # Single .dem file upload
            result = await asyncio.to_thread(init_demo, temp_path)
            map_name, teams, tournaments = result
            
            map = {
                "map": map_name,
                "team1": teams[0],
                "team2": teams[1],
            }
            
            maps.append(map)

        return {"maps": maps, "tournaments": tournaments}
    except Exception as e:
        print("Exception occurred:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.post("/upload")
async def upload_demo(file: UploadFile = File(...)):
    try:
        temp_path = await asyncio.to_thread(save_temp_file, file)

        if file.filename.endswith(".zip"):
            first_demo = None
            series_id = str(uuid.uuid4())
            
            with zipfile.ZipFile(temp_path, 'r') as zip_ref:
                with tempfile.TemporaryDirectory() as extract_dir:
                    # Extract the files
                    zip_ref.extractall(extract_dir)

                    # List of extracted demo files
                    temp_demo_paths = []

                    # Copy demo files to a persistent location
                    for name in zip_ref.namelist():
                        if name.endswith(".dem"):
                            print('processing demo', name)
                            dem_path = os.path.join(extract_dir, name)
                            
                            # Copy the demo file to a persistent location
                            temp_demo_path = os.path.join(tempfile.gettempdir(), os.path.basename(name))
                            shutil.copy2(dem_path, temp_demo_path)  # Ensure it copies with the same metadata
                            temp_demo_paths.append(temp_demo_path)

            # Process the copied demo files
            for dem_path in temp_demo_paths:
                result = await asyncio.to_thread(process_demo, dem_path, series_id)
                if result and not first_demo:
                    first_demo = result
                else:
                    cleanup_failed_upload()  # Optionally log or track failed ones

            # Final response
            if first_demo:
                demo_id, dem = first_demo
                return JSONResponse(content={
                    "success": True,
                    "message": "Demo parsed successfully.",
                    "demo_id": demo_id,
                    "map": dem.header['map_name']
                })
            else:
                cleanup_failed_upload()
                return JSONResponse(status_code=400, content={
                    "success": False,
                    "message": "Failed to parse demo file."
                })

        else:
            result = await asyncio.to_thread(process_demo, temp_path)

            if result:
                demo_id, dem = result
                return JSONResponse(content={
                    "success": True,
                    "message": "Demo parsed successfully.",
                    "demo_id": demo_id,
                    "map": dem.header['map_name']
                })
            else:
                cleanup_failed_upload()
                return JSONResponse(status_code=400, content={
                    "success": False,
                    "message": "Failed to parse demo file."
                })

    except Exception as e:
        print("Exception occurred:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
        
def save_temp_file(file: UploadFile) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".dem", mode="wb") as tmp:
        shutil.copyfileobj(file.file, tmp)
        return tmp.name


def init_demo(temp_path: str):
    _, dem, game_times = parse_demo(temp_path)

    map = dem.header['map_name']
    tournaments = get_all_tournaments()
    teams = sorted(game_times['team_clan_name'].drop_nulls().unique().to_list())
    
    return map, teams, tournaments

def process_demo(temp_path: str, series_id: str = "") -> tuple[str, Demo]:
    demo_id, dem, game_times = parse_demo(temp_path)
    if write_demo_rounds(dem, demo_id, game_times, series_id):
        return demo_id, dem
    return None


@app.delete("/delete/{demo_id}")
def delete_demo(demo_id: str):
    if delete_demo_rounds(demo_id):
        return {"message": f"Demo {demo_id} deleted successfully."}
    else:
        raise HTTPException(status_code=400, detail="Error Deleting Demo")
    
    
@app.get("/admin")
def admin():
    return {"db_demos": demos(), "storage": storage()}
