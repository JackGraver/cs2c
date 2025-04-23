from typing import List, Dict, Any
import polars as pl
from awpy import Demo  # or from awpy.parser import Demo depending on your version

SECONDARIES = {"USP-S", "Glock", "P250", "Five-SeveN", "Dual Berettas", "Tec-9", "Desert Eagle"}
PRIMARIES = {"AK-47", "M4A1-S", "AWP", "FAMAS", "Galil AR"}
GRENADES = {"Flashbang", "Smoke Grenade", "Molotov", "High Explosive Grenade", "Decoy", "Incendiary Grenade"}

def classify_inventory(items: List[str]) -> Dict[str, Any]:
    knife = items[0] if items else None
    secondary = None
    primary = None
    grenades = []

    for item in items[1:]:
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

class Parser:
    def has_demo(self):
        return self.has_demo

    def parse_demo(self, file_path: bytes) -> bool:
        try:
            self.dem = Demo(file_path, verbose=False)
            self.dem.parse(player_props=["health", "armor_value", "yaw", "inventory"])
            self.game_times = self.dem.parse_ticks(other_props=["game_time"])
            self.has_demo = True
            return True
        except Exception as e:
            print(f"Error parsing demo: {e}")
            self.has_demo = False
            return False

    def get_round(self, round_num: int = 0) -> List[Dict[str, Any]]:
        round_info = self.dem.rounds.filter(pl.col("round_num") == round_num)
        start_tick = round_info[0, "freeze_end"]
        end_tick = round_info[0, "end"]
        tick_list = list(range(start_tick, end_tick + 1, 32))

        player_ticks = self.dem.ticks.filter(
            (pl.col("round_num") == round_num) & (pl.col("tick").is_in(tick_list))
        ).group_by("tick", maintain_order=True).all()

        grouped_dict = player_ticks.to_dict(as_series=False)
        grouped_dict = {
            tick: {
                "X": grouped_dict["X"][i],
                "Y": grouped_dict["Y"][i],
                "side": grouped_dict["side"][i],
                "health": grouped_dict["health"][i],
                "name": grouped_dict["name"][i],
                "yaw": grouped_dict["yaw"][i],
                "inventory": grouped_dict.get("inventory", [])[i]
            }
            for i, tick in enumerate(grouped_dict["tick"])
        }

        r1_smokes = self.dem.smokes.filter(pl.col("round_num") == round_num).to_pandas()
        r1_molly = self.dem.infernos.filter(pl.col("round_num") == round_num).to_pandas()
        active_grenades = self.dem.grenades.filter(
            (pl.col("round_num") == round_num) & pl.col("X").is_not_null() & pl.col("tick").is_in(tick_list)
        ).to_pandas()

        grenade_by_tick = active_grenades.groupby("tick")[["thrower", "grenade_type", "X", "Y", "entity_id"]].apply(
            lambda x: x.to_dict("records")
        ).to_dict()

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

            tick_game_time = self.game_times.filter(pl.col('tick') == tick)[0]
            round_start_game_time = self.game_times.filter(pl.col('tick') == start_tick)[0]
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