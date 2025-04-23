import shutil
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from awpy import Demo
from fastapi.responses import JSONResponse
import polars as p
import tempfile
import os

from parser import Parser

# uvicorn main:app --reload --host 127.0.0.1 --port 8000

app = FastAPI()

parser = Parser()

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

@app.get("/round/{round_num}")
def get_player_data(round_num: int):
    round = parser.read_demo_round(round_num)
    round_info = parser.read_demo_round_info()
    if round and round_info:
        return {"data": round, "rounds": round_info}
    else:
        raise HTTPException(status_code=400, detail=f"Unable to read round {round_num}.")

@app.post("/upload")
async def upload_demo(file: UploadFile = File(...)):
    try:
        # Save uploaded file to a temp location using the already opened tmp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".dem", mode="wb") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_path = tmp.name  # Save the path before it closes

        # Parse the demo using the path
        success = parser.parse_demo(temp_path)

        if success:
            return JSONResponse(content={"success": True, "message": "Demo parsed successfully."})
        else:
            return JSONResponse(status_code=400, content={"success": False, "message": "Failed to parse demo file."})

    except Exception as e:
        print(str(e))
        return JSONResponse(status_code=500, content={"success": False, "message": f"Server error: {str(e)}"})