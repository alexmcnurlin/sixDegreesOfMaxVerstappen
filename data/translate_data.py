import argparse
import json
from collections import defaultdict, OrderedDict
from itertools import combinations
from pathlib import Path

import pandas as pd


def add_manual_pairings(drivers):
    """Add driver pairings not in the source dataset.

    The original dataset doesn't include data for the 2025 season
    """
    next_id = 1100000

    # Updates from the 2025 season
    new_pairings = [
        ("Isack Hadjar", "Yuki Tsunoda"),  # Australia
        ("Isack Hadjar", "Liam Lawson"),  # Japan
        ("Max Verstappen", "Yuki Tsunoda"),  # Japan
        ("Max Verstappen", "Liam Lawson"),  # Australia
        ("Kimi Antonelli", "George Russell"),  # Australia
        ("Jack Doohan", "Pierre Gasly"),  # Australia
        ("Franco Colapinto", "Pierre Gasly"),  # Imola
        ("Gabriel Bortaletto", "Nico H\u00fclkenberg"),  # Australia
        ("Lewis Hamilton", "Charles Leclerc"),  # Australia
        ("Oliver Bearman", "Esteban Ocon"),  # Australia
        ("Alexander Albon", "Carlos Sainz"),  # Australia
    ]

    for driver1, driver2 in new_pairings:
        try:
            d1 = next(d for d in drivers.values() if d["name"] == driver1)
        except StopIteration:
            d1 = {"id": str(next_id), "name": driver1, "teammates": dict()}
            drivers[str(next_id)] = d1
            next_id += 1
        try:
            d2 = next(d for d in drivers.values() if d["name"] == driver2)
        except StopIteration:
            d2 = {"id": str(next_id), "name": driver2, "teammates": dict()}
            drivers[str(next_id)] = d2
            next_id += 1

        d1["teammates"][d2["id"]] = ("idk", "01-01-1970")
        d2["teammates"][d1["id"]] = ("idk", "01-01-1970")

    return drivers


def add_dank_drivers(drivers):
    """Add a couple drivers for the memes :)"""

    def add_alias(name, alias, id):
        original = next(d for d in drivers if d["name"] == name)
        aliased = {"id": id, "name": alias, "teammates": list(original["teammates"])}
        for teammate in aliased["teammates"]:
            for driver in drivers:
                if driver["id"] == teammate:
                    driver["teammates"].append(id)

        drivers.append(aliased)

    add_alias("Max Verstappen", "Franz Hermann", "1000000")
    add_alias("Kimi Antonelli", "Henry Shovlin", "1000001")

    return drivers


def register_pairing(d1, d2):
    d1_id = str(d1["driverId"])
    d2_id = str(d2["driverId"])
    race = d1["name"]
    date = d1["date"]
    url = d1["url_y"]

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

    drivers = pd.read_csv(args.input / "drivers.csv")
    print(f"Loaded {len(drivers)} drivers")
    races = pd.read_csv(args.input / "races.csv")
    race_results = pd.read_csv(args.input / "results.csv")
    status = pd.read_csv(args.input / "status.csv")

    with_drivers = pd.merge(race_results, drivers, how="left", on="driverId")
    with_races = pd.merge(with_drivers, races, how="left", on="raceId")
    with_races = with_races.sort_values("date", ascending=True)
    # Filter out statuses where the driver didn't start the race
    # There are a few of these where the driver DID finish the race, but I can't
    # find a better way to determine the truth
    # 54 = Withdrew
    # 73 = Injured (usually during quali. All instances are a DNS)
    # 77 = 107% rule
    # 81 = Did Not Qualify
    # 82 = Injury (see "Injured". The only "injury" that started a race was Jonny Herbert, 1998 Brazilian GP)
    # 89 = Safety Concerns
    # 96 = Excluded
    # 97 = Did Not Prequalify
    with_races = with_races.query("statusId not in [54, 73, 77, 81, 96, 97]")

    pairings = with_races.groupby(["raceId", "constructorId"], sort=False)
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
    # results = add_manual_pairings(results)

    # The defaultDict leaves an empty entry in the final collection. Remove it
    drivers_list = [collapse_teammates(d) for d in results.values() if "id" in d]
    # drivers_list = add_dank_drivers(drivers_list)

    # TODO: We lose 6 drivers somewhere :( Why?
    print(f"Dumping {len(drivers_list)} drivers to {args.output}")
    with open(args.output, "w+") as f:
        json.dump(drivers_list, f, indent=4)
