#!/usr/bin/env python3
"""Update F1 driver teammate data from the current Jolpica/Ergast results page."""

from __future__ import annotations

import argparse
import json
import unicodedata
from collections import defaultdict
from datetime import date
from itertools import combinations
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import urlopen


API_BASE = "https://api.jolpi.ca/ergast/f1/{year}/results/"


def driver_name(driver: dict[str, Any]) -> str:
    return repair_mojibake(f"{driver['givenName']} {driver['familyName']}")


def repair_mojibake(value: str) -> str:
    if "Ã" not in value and "Â" not in value:
        return value

    try:
        return value.encode("latin1").decode("utf-8")
    except UnicodeError:
        return value


def name_key(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", repair_mojibake(name))
    without_accents = "".join(
        character for character in normalized if not unicodedata.combining(character)
    )
    return " ".join(without_accents.casefold().split())


def load_json(path: Path) -> Any:
    with path.open() as file:
        return json.load(file)


def write_json(path: Path, data: Any) -> None:
    with path.open("w") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)
        file.write("\n")


def fetch_results_page(year: int, limit: int) -> dict[str, Any]:
    first_page = fetch_results(year, limit=limit)
    metadata = first_page["MRData"]
    total = int(metadata.get("total", 0))
    latest_offset = max(total - limit, 0)

    if latest_offset == int(metadata.get("offset", 0)):
        return first_page

    return fetch_results(year, limit=limit, offset=latest_offset)


def fetch_results(year: int, limit: int, offset: int | None = None) -> dict[str, Any]:
    params: dict[str, str | int] = {"format": "json", "limit": limit}
    if offset is not None:
        params["offset"] = offset

    url = f"{API_BASE.format(year=year)}?{urlencode(params)}"
    with urlopen(url, timeout=30) as response:
        return json.load(response)


def next_driver_id(drivers: list[dict[str, Any]]) -> str:
    numeric_ids = [int(driver["id"]) for driver in drivers if str(driver["id"]).isdigit()]
    return str(max(numeric_ids, default=0) + 1)


def find_or_create_driver(
    api_driver: dict[str, Any],
    drivers: list[dict[str, Any]],
    drivers_by_name: dict[str, dict[str, Any]],
    summary: dict[str, int],
) -> dict[str, Any]:
    full_name = driver_name(api_driver)
    key = name_key(full_name)
    existing = drivers_by_name.get(key)
    if existing:
        return existing

    new_driver = {
        "teammates": [],
        "id": next_driver_id(drivers),
        "url": api_driver.get("url", ""),
        "name": full_name,
    }
    drivers.append(new_driver)
    drivers_by_name[key] = new_driver
    summary["drivers_added"] += 1
    print(f"Added driver: {new_driver['name']} ({new_driver['id']})")
    return new_driver


def race_entry(race: dict[str, Any]) -> dict[str, Any]:
    return {
        "startDate": race["date"],
        "startRace": race["raceName"],
        "startUrl": race["url"],
        "count": 1,
    }


def race_already_recorded(date_range: dict[str, Any], race: dict[str, Any]) -> bool:
    race_date = race["date"]
    return race_date in {date_range["startDate"], date_range.get("endDate")}


def record_pairing(
    driver: dict[str, Any],
    teammate: dict[str, Any],
    race: dict[str, Any],
    summary: dict[str, int],
) -> None:
    teammate_entry = next(
        (entry for entry in driver["teammates"] if entry["id"] == teammate["id"]),
        None,
    )

    if teammate_entry is None:
        driver["teammates"].append({"id": teammate["id"], "dates": [race_entry(race)]})
        summary["pairings_added"] += 1
        return

    latest_range = teammate_entry["dates"][-1]
    if race_already_recorded(latest_range, race):
        summary["pairings_skipped"] += 1
        return

    if race["date"] < latest_range.get("endDate", latest_range["startDate"]):
        summary["pairings_skipped"] += 1
        return

    latest_range["count"] += 1
    latest_range["endDate"] = race["date"]
    latest_range["endRace"] = race["raceName"]
    latest_range["endUrl"] = race["url"]
    summary["ranges_extended"] += 1


def constructors_for_race(race: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    constructors: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for result in race.get("Results", []):
        constructor_id = result["Constructor"]["constructorId"]
        constructors[constructor_id].append(result["Driver"])
    return constructors


def update_drivers(
    drivers: list[dict[str, Any]], results_page: dict[str, Any]
) -> dict[str, int]:
    summary = {
        "drivers_added": 0,
        "pairings_added": 0,
        "ranges_extended": 0,
        "pairings_skipped": 0,
        "races_seen": 0,
    }
    drivers_by_name = {name_key(driver["name"]): driver for driver in drivers}
    races = results_page["MRData"]["RaceTable"].get("Races", [])

    for race in sorted(races, key=lambda item: item["date"]):
        summary["races_seen"] += 1
        for api_drivers in constructors_for_race(race).values():
            unique_api_drivers = {
                name_key(driver_name(api_driver)): api_driver for api_driver in api_drivers
            }
            if len(unique_api_drivers) < 2:
                continue

            matched_drivers = [
                find_or_create_driver(api_driver, drivers, drivers_by_name, summary)
                for api_driver in unique_api_drivers.values()
            ]
            for driver, teammate in combinations(matched_drivers, 2):
                record_pairing(driver, teammate, race, summary)
                record_pairing(teammate, driver, race, summary)

    return summary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Update server/src/drivers.json from current-year F1 results."
    )
    parser.add_argument(
        "--year",
        type=int,
        default=date.today().year,
        help="F1 season year to fetch. Defaults to the current year.",
    )
    parser.add_argument(
        "--drivers",
        type=Path,
        default=Path("server/src/drivers.json"),
        help="Path to the driver dataset.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=30,
        help="Result-page size to fetch from the API.",
    )
    args = parser.parse_args()

    drivers = load_json(args.drivers)
    results_page = fetch_results_page(args.year, args.limit)
    summary = update_drivers(drivers, results_page)
    write_json(args.drivers, drivers)

    print(
        "Update complete: "
        f"{summary['races_seen']} races seen, "
        f"{summary['drivers_added']} drivers added, "
        f"{summary['pairings_added']} pairings added, "
        f"{summary['ranges_extended']} ranges extended, "
        f"{summary['pairings_skipped']} pairings skipped."
    )


if __name__ == "__main__":
    main()
