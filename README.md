# Six Degrees of Verstappen

## Introduction

You've likely heard of the [six degrees of Kevin Bacon](https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon) - Most actors have been in a movie with someone who's been in a movie with someone who's been in a movie with Kevin Bacon.

This site is trying to explore the same question for Formula 1. Can you link every driver through a series of teammate connections? I.e. Max Verstappen was teammates with Carlos Sainz Jr (Toro Rosso, 2015), who was teammates with Charles Leclerc (Ferrari, 2021-2024), who is teammates with Lewis Hamilton (Ferrari, 2025-). This is 3 degrees of separation.

- Is every driver connected in this way? I.e. are there any drivers that can't be connected to any other driver?
- What is the average number of connections between all drivers?
- What is the longest connection?

## Development

Note: Development was done in MacOS, but _should_ work in a Windows/Linux development environment.

Project structure

- `/client` - The UI, using React with Apollo GraphQL Client
  - `npm start`
- `/server` - The back end, using Typescript with Apollo GraphQL Server
  - `npm start`
- `/data` - The source data used to generate [drivers.json](server/drivers.json) in the server.

Environmet setup - Ensure `npm` is installed with your package manager of choice

- `winget install npm` # TODO: Verify this is right
- `brew install npm`
- `apt install npm` # TODO: Verify this is right

## TODO

Here's a list of TODO items that I want to complete before I'd consider this project presentable

- Add scripts to run all tests
- Move codegen config/scripts to shared folder
- Add playwright tests for DegreesOfSeparation
- Add 2025 drivers
- Add the total race count to the driver pairings
- Figure out why dark mode isn't working
- Change description paragraph in App.tsx
- Check for outstanding TODOs
- Deploy to production
