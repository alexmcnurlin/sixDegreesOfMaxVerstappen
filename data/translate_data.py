import argparse
import json
from collections import defaultdict, OrderedDict
from itertools import combinations
from pathlib import Path

import pandas as pd


def register_pairing(d1, d2):
    d1_id = str(d1["driver_id"])
    d2_id = str(d2["driver_id"])
    race = d1["name"]
    date = d1["date"]
    url = d1["wikipedia_y"]

    # Add the drivers to our dictionary, if they aren't in there
    if d1_id not in results:
        results[d1_id]["id"] = d1_id
        results[d1_id]["name"] = d1["forename"] + " " + d1["surname"]

    d1_teammates = results[d1_id]["teammates"]
    last_teammate = d1_teammates[-1] if d1_teammates else None

    # If these drivers were already teammates, update the end
    if last_teammate and last_teammate["id"] == d2_id:
        last_teammate["endRace"] = race
        last_teammate["endDate"] = date
        last_teammate["endUrl"] = url
        last_teammate["count"] += 1
    else:
        # If they weren't teammates, add this to the list
        d1_teammates.append(
            {
                "id": d2_id,
                "startRace": race,
                "startDate": date,
                "startUrl": url,
                "count": 1,
                "endRace": race,
                "endDate": date,
                "endUrl": url,
            }
        )


def collapse_teammates(driver):
    """
    If a driver was teammates with another driver multiple times, collapse that
    into one object
    """
    # Group entries by teammate ID, preserving the order that they show up
    teammates = OrderedDict()
    for tm in driver["teammates"]:
        key = tm["id"]
        if key not in teammates:
            teammates[key] = []
        teammates[key].append(tm)

    return {
        "id": driver["id"],
        "name": driver["name"],
        "teammates": [
            {
                "id": tm_id,
                "dates": [
                    {
                        "startDate": tm["startDate"],
                        "startRace": tm["startRace"],
                        "startUrl": tm["startUrl"],
                        "count": tm["count"],
                        "endDate": tm["endDate"],
                        "endRace": tm["endRace"],
                        "endUrl": tm["endUrl"],
                    }
                    for tm in tms
                ],
            }
            for tm_id, tms in teammates.items()
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Translates CSV driver data into a structured JSON."
    )
    parser.add_argument("output", type=Path, help="The output file to generate.")
    parser.add_argument("--input", "-i", type=Path, help="The folder with all CSV data")
    args = parser.parse_args()

    session_entries = pd.read_csv(args.input / "formula_one_sessionentry.csv")
    rounds = pd.read_csv(args.input / "formula_one_round.csv")
    round_entries = pd.read_csv(args.input / "formula_one_roundentry.csv")
    sessions = pd.read_csv(args.input / "formula_one_session.csv")
    team_drivers = pd.read_csv(args.input / "formula_one_teamdriver.csv")
    drivers = pd.read_csv(args.input / "formula_one_driver.csv")
    print(f"Loaded {len(drivers)} drivers")

    all_sessions = pd.merge(
        session_entries, sessions, how="left", left_on="session_id", right_on="id"
    )

    all_sessions = (
        # Get the results of every session
        session_entries.merge(sessions, how="left", left_on="session_id", right_on="id")
        # Filter out races
        .query("type == 'R'")
        # Only include race starts. We have to manually list out the statuses to exclude
        # There are a few with "Withdrew" or "Illness" that did start the race
        # If any driver started the race, but got sick during lap 1 chaos, oh well!
        .query(
            "(laps_completed > 0) or status not in ['Withdrew', 'Injury', 'Physical', 'Injured', 'Driver unwell', 'Disqualified', 'Excluded', 'Safety concerns', 'Underweight', 'Safety', 'Did not start', 'Illness']"
        )
        .merge(rounds, left_on="round_id", right_on="id")
        .merge(round_entries, left_on="round_entry_id", right_on="id")
        .merge(team_drivers, left_on="team_driver_id", right_on="id")
        .merge(drivers, left_on="driver_id", right_on="id")
    )

    pairings = all_sessions.groupby(["session_id", "team_id"], sort=False)
    results = defaultdict(lambda: {"teammates": []})

    def build_driver_data(series):
        if len(series) == 1:
            return
        if len(series) > 2:
            indices = range(0, len(series))
            for i1, i2 in combinations(indices, 2):
                if i1 != i2:
                    build_driver_data(series.iloc[[i1, i2]])
            return

        register_pairing(series.iloc[0], series.iloc[1])
        register_pairing(series.iloc[1], series.iloc[0])

    pairings.apply(build_driver_data)

    # The defaultDict leaves an empty entry in the final collection. Remove it
    drivers_list = [collapse_teammates(d) for d in results.values() if "id" in d]

    print(f"Dumping {len(drivers_list)} drivers to {args.output}")
    with open(args.output, "w+") as f:
        json.dump(drivers_list, f, indent=4)
