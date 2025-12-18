import argparse
import json
from collections import defaultdict
from itertools import product
from pathlib import Path

import pandas as pd


def add_manual_pairings(drivers):
    """Add driver pairings not in the source dataset.

    The original dataset doesn't include data for the 2025 season
    """
    next_id = 1100000

    # Updates from the 2025 season
    new_pairings = [
        ("Isack Hadjar", "Yuki Tsunoda"), # Australia
        ("Isack Hadjar", "Liam Lawson"), # Japan
        ("Max Verstappen", "Yuki Tsunoda"), # Japan
        ("Max Verstappen", "Liam Lawson"), # Australia
        ("Kimi Antonelli", "George Russell"), # Australia
        ("Jack Doohan", "Pierre Gasly"), # Australia
        ("Franco Colapinto", "Pierre Gasly"), # Imola
        ("Gabriel Bortaletto", "Nico H\u00fclkenberg"), # Australia
        ("Lewis Hamilton", "Charles Leclerc"), # Australia
        ("Oliver Bearman", "Esteban Ocon"), # Australia
        ("Alexander Albon", "Carlos Sainz") # Australia
    ]

    for driver1, driver2 in new_pairings:
        try:
            d1 = next(d for d in drivers.values() if d["name"] == driver1)
        except StopIteration:
            d1 = {
                "id": str(next_id),
                "name": driver1,
                "teammates": set()
            }
            drivers[str(next_id)] = d1
            next_id += 1
        try:
            d2 = next(d for d in drivers.values() if d["name"] == driver2)
        except StopIteration:
            d2 = {
                "id": str(next_id),
                "name": driver2,
                "teammates": set()
            }
            drivers[str(next_id)] = d2
            next_id += 1

        d1["teammates"].add(d2["id"])
        d2["teammates"].add(d1["id"])

    return drivers


def add_dank_drivers(drivers):
    """Add a couple drivers for the memes :)"""
    def add_alias(name, alias, id):
        original = next(d for d in drivers if d["name"] == name)
        aliased = {
            "id": id,
            "name": alias,
            "teammates": list(original["teammates"])
        }
        for teammate in aliased["teammates"]:
            for driver in drivers:
                if driver["id"] == teammate:
                    driver["teammates"].append(id)

        drivers.append(aliased)

    add_alias("Max Verstappen", "Franz Hermann", "1000000")
    add_alias("Kimi Antonelli", "Henry Shovlin", "1000001")

    return drivers


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Translates CSV driver data into a structured JSON.")
    parser.add_argument("output", type=Path, help="The output file to generate.")
    parser.add_argument("--input", "-i", type=Path, help="The folder with all CSV data")
    args = parser.parse_args()

    drivers = pd.read_csv(args.input/"drivers.csv")
    print(f"Loaded {len(drivers)} drivers")
    races = pd.read_csv(args.input/"races.csv")
    race_results = pd.read_csv(args.input/"results.csv")
    status = pd.read_csv(args.input/"status.csv")

    with_drivers = pd.merge(race_results, drivers, how="left", on="driverId")
    with_races = pd.merge(with_drivers, races, how="left", on="raceId")

    pairings = with_races.groupby(["raceId", "constructorId"])
    results = defaultdict(lambda: { "teammates": set()})

    def build_driver_data(series):
        if len(series) == 1:
            return
        if len(series) > 2:
            indices = range(0, len(series))
            for i1, i2 in product(indices, indices):
                if i1 != i2:
                    build_driver_data(series.iloc[[i1, i2]])
            return

        driver1 = series.iloc[0]
        driver1_id = str(driver1["driverId"])
        driver2 = series.iloc[1]
        driver2_id = str(driver2["driverId"])
        # import pdb; pdb.set_trace()
        if driver1_id not in results:
            results[driver1_id]["id"] = driver1_id
            results[driver1_id]["name"] = driver1["forename"] + " " + driver1["surname"]
        if driver2_id not in results:
            results[driver2_id]["id"] = driver2_id
            results[driver2_id]["name"] = driver2["forename"] + " " + driver2["surname"]

        results[driver1_id]["teammates"].add(driver2_id)
        results[driver2_id]["teammates"].add(driver1_id)

    pairings.apply(build_driver_data)
    results = add_manual_pairings(results)
    # We can't serialize a set, so convert it to a list
    for result in results.values():
        result["teammates"] = list(result["teammates"])
    # The defaultDict leaves an empty entry in the final collection. Remove it
    drivers_list = [d for d in results.values() if "id" in d]
    drivers_list = add_dank_drivers(drivers_list)

    # TODO: We lose 6 drivers somewhere :( Why?
    print(f"Dumping {len(drivers_list)} drivers to {args.output}")
    with open(args.output, "w+") as f:
        json.dump(drivers_list, f, indent=4)
