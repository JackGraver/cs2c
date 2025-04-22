from fastapi import FastAPI
import random
from fastapi.middleware.cors import CORSMiddleware
from awpy import Demo
import polars as pl
from awpy.plot import plot, PLOT_SETTINGS

# uvicorn main:app --reload --host 127.0.0.1 --port 8000

dem = Demo("mouz-vs-vitality-m3-inferno.dem", verbose=False)
dem.parse(player_props=["health", "armor_value", "yaw", 'inventory'])
game_times = dem.parse_ticks(other_props=['game_time'])

app = FastAPI()

SECONDARIES = {"USP-S", "Glock", "P250", "Five-SeveN", "Dual Berettas", "Tec-9", "Desert Eagle", }
PRIMARIES = {"AK-47", "M4A1-S", "AWP", "FAMAS", "Galil AR"}
GRENADES = {"Flashbang", "Smoke Grenade", "Molotov", "High Explosive Grenade", "Decoy", "Incendiary Grenade"}

def classify_inventory(items):
    if(len(items) != 0):
        knife = items[0]  # always present, always first
    else:
        knife = None
    secondary = None
    primary = None
    grenades = []

    for item in items[1:]:  # skip knife
        if item in SECONDARIES:
            secondary = item
        elif item in PRIMARIES:
            primary = item
        elif item in GRENADES:
            grenades.append(item)

    return {
        "knife": knife,
        "secondary": secondary,
        "primary": primary,
        "grenades": grenades
    }

def format_clock(seconds: float) -> str:
    m = int(seconds) // 60
    s = int(seconds) % 60
    return f"{m}:{s:02}"

def processRoundInformation(round):
    # Step 1: Get start/end ticks for round
    round_info = dem.rounds.filter(pl.col("round_num") == round)
    start_tick = round_info[0, "freeze_end"]
    end_tick = round_info[0, "end"]
    tick_list = list(range(start_tick, end_tick + 1, 32))  # You can change step to 64 if needed

    # Step 2: Get player data only for relevant ticks
    player_ticks = dem.ticks.filter(
        (pl.col("round_num") == round) & (pl.col("tick").is_in(tick_list))
    ).group_by("tick", maintain_order=True).all()

    # Step 3: Convert player info to dict
    grouped_dict = player_ticks.to_dict(as_series=False)
    grouped_dict = {
        tick: {
            "X": grouped_dict["X"][i],
            "Y": grouped_dict["Y"][i],
            "side": grouped_dict["side"][i],
            "health": grouped_dict["health"][i],
            "name": grouped_dict["name"][i],
            "yaw": grouped_dict["yaw"][i],
            "inventory": grouped_dict.get("inventory", [])[i]  # Make sure inventory exists
        }
        for i, tick in enumerate(grouped_dict["tick"])
    }

    # Step 4: Filter smokes, mollys, and grenades
    r1_smokes = dem.smokes.filter(pl.col("round_num") == round).to_pandas()
    r1_molly = dem.infernos.filter(pl.col("round_num") == round).to_pandas()
    active_grenades = dem.grenades.filter(
        (pl.col("round_num") == round) &
        (pl.col("X").is_not_null()) &
        (pl.col("tick").is_in(tick_list))
    ).to_pandas()

    grenade_by_tick = active_grenades.groupby("tick")[["thrower", "grenade_type", "X", "Y", "entity_id"]].apply(lambda x: x.to_dict("records")).to_dict()

    # Step 5: Loop through ticks and compile output
    tick_data_list = []

    for tick in tick_list:
        player_row = grouped_dict.get(tick, {
            "name": [], "X": [], "Y": [], "side": [], "health": [], "yaw": [], "inventory": []
        })

        players = []
        for i in range(len(player_row["name"])):
            inv = classify_inventory(player_row["inventory"][i])
            players.append({
                "name": player_row["name"][i],
                "X": player_row["X"][i],
                "Y": player_row["Y"][i],
                "side": player_row["side"][i],
                "health": player_row["health"][i],
                "yaw": player_row["yaw"][i],
                **inv
            })

        active_smokes = r1_smokes.query(f"{tick} >= start_tick and {tick} <= end_tick")[["X", "Y", "start_tick", "end_tick"]].to_dict("records")
        active_molly = r1_molly.query(f"{tick} >= start_tick and {tick} <= end_tick")[["X", "Y", "start_tick", "end_tick"]].to_dict("records")
        airborne_grenades = grenade_by_tick.get(tick, [])

        # clock_time = round_duration - (tick_game_time - round_start_game_time)
        tick_game_time = game_times.filter(pl.col('tick') == tick)[0]
        round_start_game_time = game_times.filter(pl.col('tick') == start_tick)[0]
        time = 115 - (tick_game_time['game_time'] - round_start_game_time['game_time'])
        time = format_clock(time[0])

        tick_data_list.append({
            "tick": tick,
            "time": time,
            "players": players,
            "activeSmokes": active_smokes,
            "activeMolly": active_molly,
            "activeGrenades": airborne_grenades,
            "shots": []
        })

    return tick_data_list

print(processRoundInformation(1)[0])

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
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/round/{round_num}")
def get_player_data(round_num: int):
    round = processRoundInformation(round_num)
    round_info = dem.rounds['round_num', 'winner']
    return {"data": round, "rounds": round_info.to_dicts()}