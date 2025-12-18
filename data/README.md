# Data

This folder contains the source used to genererate the [drivers.json](../server/drivers.json) used by the server!

## Setup

- Recommended: Create a python virtual environment
  - `python -m pip .venv`
  - `source ./.venv/bin/activate` or `& .\.venv\bin\activate.ps1`
- Install dependencies
  - `python -m pip install -r requirements.txt`

## How to run

From this folder:
`python ./translate_data.py --output ../server/drivers.json --input .`
