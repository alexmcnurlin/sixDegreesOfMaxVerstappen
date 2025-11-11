# Six Degrees of Verstappen

## Introduction
You've likely heard of the [six degrees of Kevin Bacon](https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon) - Most actors have been in a movie with someone who's been in a movie with someone who's been in a movie with Kevin Bacon.

This site is trying to explore the same question for Formula 1. Can you link every driver through a series of teammate connections? I.e. Max Verstappen was teammates with Carlos Sainz Jr (Toro Rosso, 2015), who was teammates with Charles Leclerc (Ferrari, 2021-2024), who is teammates with Lewis Hamilton (Ferrari, 2025-). This is 3 degrees of separation.

* Is every driver connected in this way? I.e. are there any drivers that can't be connected to any other driver?
* What is the average number of connections between all drivers?
* What is the longest connection?

## Development

Note: Development was done in MacOS, but should work in a Windows/Linux development environment.

Project structure
* `/client` - The UI, written in React
    - Ensure `npm` is installed with your package manager of choice
        - `winget install npm` # TODO: Verify this is right
        - `brew install npm`
        - `apt install npm` # TODO: Verify this is right
* `/server` - The back end, written in C#
    - Ensure `dotnet` is installed
        * `winget install -e Microsoft.DotNet` # TODO: Make sure this is the right command
        * `brew install dotnet`



## TODO

Here's a list of TODO items that I want to complete before I'd consider this project presentable
* Set up dotnet app
* Set up graphql server
* Find full dump of driver data
* Add `appsettings.json` to configure launch parameters
* Build workflow for launching/testing app
* Convert driver data to json file
* Convert driver data to a proper database
