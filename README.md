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

- `/client` - The UI, using Typescript, React, Apollo GraphQL Client. Built with `vite`
- `/server` - The back end, using Typescript (via `babel`) with Apollo GraphQL Server.
- `/data` - The source data used to generate [drivers.json](server/drivers.json) in the server. Generated with Python

### Environment setup

1. [Install `Node.js`](https://nodejs.org/en/download)
2. Run `npm install` in the CLI
   - There are `package.json` files in the root of the project, the `server`, and the `client` folders. Running `npm install` will install packages for all of them.

### Run development environment

`npm start`

- This will do everything needed to build/run the server and client.

To run everything individually

- Copy config files: `npm run prebuild-client` or `npm run prebuild-server`
- Generate GraphQL: `npm run gql`
- Build server/client (from `server/` or `client/`): `npm run build`
- Run server/client (from `server/` or `client/`): `npm start`
  - If you want the Server to auto-reload when changes are made, you have to run `npm run build-watch` and `npm run start-watch` in separate terminals.

### Test

From the `server/` or `client/` folders: `npm test`
