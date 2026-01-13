import argparse
import json
from collections import defaultdict, OrderedDict
from itertools import combinations
from pathlib import Path

import pandas as pd


def register_pairing(d1, d2, results):
    """Record the pair of drivers as teammates.

    Builds a range of when drivers were teammates.
    """
    d1_id = str(d1["driver_id"])
    d2_id = str(d2["driver_id"])
    driver_url = d1["wikipedia_y"]
    race = d1["name"]
    date = d1["date"]
    race_url = d1["wikipedia_x"]

    # Add the driver to our dictionary, if they aren't in there
    if d1_id not in results:
        results[d1_id]["id"] = d1_id
        results[d1_id]["url"] = driver_url
        results[d1_id]["name"] = d1["forename"] + " " + d1["surname"]

    d1_teammates = results[d1_id]["teammates"]
    # Teams could have 3 or more drivers until 1992, so find every driver that
    # d1 was teammates with in their previous race
    dates = [
        teammates["endDate"]
        for teammates in d1_teammates
        if teammates["endDate"] != date
    ]
    last_race = sorted(dates)[-1] if dates else None
    last_teammates = {tm["id"]: tm for tm in d1_teammates if tm["endDate"] == last_race}

    # If driver1's last teammate was driver2 in the previous race, update that range
    # Otherwise, create a new range
    if d2_id in last_teammates:
        last_teammates[d2_id]["endRace"] = race
        last_teammates[d2_id]["endDate"] = date
        last_teammates[d2_id]["endUrl"] = race_url
        last_teammates[d2_id]["count"] += 1
    else:
        # If they weren't teammates, add this to the list
        d1_teammates.append(
            {
                "id": d2_id,
                "startRace": race,
                "startDate": date,
                "startUrl": race_url,
                "count": 1,
                "endRace": race,
                "endDate": date,
                "endUrl": race_url,
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
        **driver,
        "teammates": [
            {
                "id": tm_id,
                "dates": [
                    (
                        {
                            "startDate": tm["startDate"],
                            "startRace": tm["startRace"],
                            "startUrl": tm["startUrl"],
                            "count": tm["count"],
                            "endDate": tm["endDate"],
                            "endRace": tm["endRace"],
                            "endUrl": tm["endUrl"],
                        }
                        if tm["count"] > 1
                        else {
                            "startDate": tm["startDate"],
                            "startRace": tm["startRace"],
                            "startUrl": tm["startUrl"],
                            "count": tm["count"],
                        }
                    )
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
        # Only include Grands Prix (i.e. remoe Qualifying, Free Practice, Sprint races)
        .query("type == 'R'")
        # Only include race starts. There are a few "Withdrew" or "Injury" that
        # did start the race, so we also look at laps completed.
        .query(
            "(laps_completed > 0) or status not in ['Withdrew', 'Injury', 'Physical', 'Injured', 'Driver unwell', 'Disqualified', 'Excluded', 'Safety concerns', 'Underweight', 'Safety', 'Did not start', 'Illness']"
        )
        # Include the info for driver, team, track, ect.
        .merge(rounds, left_on="round_id", right_on="id")
        .merge(round_entries, left_on="round_entry_id", right_on="id")
        .merge(team_drivers, left_on="team_driver_id", right_on="id")
        .merge(drivers, left_on="driver_id", right_on="id")
        # The date is in YYYY-MM-DD, so we can use a Lexographic sort to sort the date!
        .sort_values("date")
    )

    pairings = all_sessions.groupby(["session_id", "team_id"], sort=False)
    results = defaultdict(lambda: {"teammates": []})

    def build_driver_data(series):
        """
        For a given team/race, record that those drivers were teammates
        """
        # Some races have multiple entries for a driver. I'm not sure why.
        # E.g. Juan Manuel Fangio at the 1950 Italian Grand Prix
        dropped = series.drop_duplicates(subset="driver_id")
        if len(dropped) < len(series):
            first = series.iloc[0]
            print(
                f"Found race with duplicated driver: {first.date.split('-')[0]} {first['name']}"
            )
            for d in series.forename + " " + series.surname:
                print("   " + d)
        if len(dropped) == 1:
            return
        # For 3+ drivers per team, recurse on every combination of drivers
        if len(dropped) > 2:
            indices = range(0, len(dropped))
            for i1, i2 in combinations(indices, 2):
                build_driver_data(dropped.iloc[[i1, i2]])
            return

        register_pairing(dropped.iloc[0], dropped.iloc[1], results)
        register_pairing(dropped.iloc[1], dropped.iloc[0], results)

    # Build the driver data for every group of driver/team
    pairings.apply(build_driver_data)

    # The defaultDict leaves an empty entry in the collection. Remove it
    drivers_list = [collapse_teammates(d) for d in results.values() if "id" in d]

    print(f"Dumping {len(drivers_list)} drivers to {args.output}")
    with open(args.output, "w+") as f:
        json.dump(drivers_list, f, indent=4)
