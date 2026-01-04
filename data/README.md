# Data

This folder contains the source used to genererate the [drivers.json](../server/drivers.json) used by the server! Data is sourced from [this dataset](https://github.com/jolpica/jolpica-f1).

## Setup

- Recommended: Create a python virtual environment
  - `python -m pip .venv`
  - `source ./.venv/bin/activate` or `& .\.venv\bin\activate.ps1`
- Install dependencies
  - `python -m pip install -r requirements.txt`
- Download CSV of source data
  - `https://api.jolpi.ca/docs/#/dumps/data_dumps_download_delayed_retrieve`

## How to run

From this folder:
`python ./translate_data.py --output ../server/drivers.json --input <path_to_csv>`
