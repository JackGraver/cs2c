import shutil
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile

from parsing.demo_parser import parse_demo
from parsing.parquet_writer import *
from db.queries import get_all_known_demos

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
    demos = get_all_known_demos()
    return {"demos": demos}
    
@app.get("/demo/{demo_id}/round/{round_num}")
def get_round_data(demo_id: str, round_num: int):
    round = read_demo_round(demo_id, round_num)
    round_info = read_demo_round_info(demo_id)
    if round and round_info:
        return {"data": round, "rounds": round_info}
    else:
        raise HTTPException(status_code=400, detail=f"Unable to read round {round_num} from demo {demo_id}.")

@app.post("/upload")
async def upload_demo(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".dem", mode="wb") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_path = tmp.name

        demo_id, dem, game_times = parse_demo(temp_path)
        if write_demo_rounds(dem, demo_id, game_times):
            return JSONResponse(content={
                "success": True,
                "message": "Demo parsed successfully.",
                "demo_id": demo_id
            })
        else:
            return JSONResponse(status_code=400, content={
                "success": False,
                "message": "Failed to parse demo file."
            })
            
    except Exception as e:
        print(str(e))
        return JSONResponse(status_code=500, content={
            "success": False,
            "message": f"Server error: {str(e)}"
        })

@app.delete("/delete/{demo_id}")
def delete_demo(demo_id: str):
    if delete_demo_rounds(demo_id):
        return {"message": f"Demo {demo_id} deleted successfully."}
    else:
        raise HTTPException(status_code=400, detail="Error Deleting Demo")