import { useQuery } from "@apollo/client/react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Autocomplete,
  Card,
  CircularProgress,
  Typography,
} from "@mui/joy";
import type { Maybe } from "graphql/jsutils/Maybe";
import { useEffect, useState } from "react";
import "./App.css";
import DegreesOfSeparation from "./DegreesOfSeparation";
import { graphql } from "./gql/gql";
import { Driver } from "./gql/graphql";

const GET_DRIVERS = graphql(`
  query GetDrivers {
    drivers {
      id
      name
    }
  }
`);

const GET_DEGREES = graphql(`
  query GetDegreesOfSeparation($driver1: String, $driver2: String) {
    degreesOfSeparation(driver1: $driver1, driver2: $driver2) {
      driver1 {
        id
        name
        teammates {
          driver {
            name
          }
        }
      }
      driver2 {
        id
        name
      }
      dates {
        startDate
        startRace
        startUrl
        count
        endDate
        endRace
        endUrl
      }
    }
  }
`);

const App = () => {
  const { data: driverData, loading: loadingDrivers } = useQuery(GET_DRIVERS);
  const drivers = driverData?.drivers ?? [];

  const max = drivers.find((d) => d.name === "Max Verstappen");

  const [driver1, setDriver1] = useState<Maybe<Driver>>();
  const [driver2, setDriver2] = useState<Maybe<Driver>>();

  useEffect(() => {
    if (!driver1 && drivers) {
      setDriver1(max);
    }
  }, [drivers, driver1]);

  const { data: degreesData, loading: loadingDegrees } = useQuery(GET_DEGREES, {
    variables: {
      driver1: driver1?.id ?? "",
      driver2: driver2?.id ?? "",
    },
    skip: !driver1 || !driver2,
  });

  const pairings = degreesData?.degreesOfSeparation;

  return loadingDrivers ? (
    <CircularProgress />
  ) : (
    <>
      <h1>
        <Typography>The Six Degrees of Max Verstappen!</Typography>
      </h1>

      <AccordionGroup>
        <Accordion>
          <AccordionSummary>How it works....</AccordionSummary>
          <AccordionDetails>
            <span id="description">
              <Typography>
                {"You may be familiar with the "}
                <a href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon">
                  Six Degrees of Kevin Bacon
                </a>
                - Most actors can be connected to Kevin Bacon by less than six
                steps. I.e. they were in a movie with someone who was in a movie
                with Kevin Bacon.
              </Typography>
              <br />
              <Typography>
                Lets apply that idea to Formula 1 drivers! Drivers are connected
                if they were teammates at any point (even one race). Max was
                teammates with Carlos Sainz Jr. (Toro Rosso, 2015), who was
                teammates with Lando Norris (McLaren, 2019). This means that
                Lando has 2 degrees of separation from Max!
              </Typography>
            </span>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>

      <br />
      <Card>
        How many degrees of separation are between
        <Autocomplete
          id="driver1"
          placeholder="Max Verstappen"
          onChange={(_, value) => setDriver1(value)}
          options={drivers}
          autoSelect
          autoHighlight
          getOptionLabel={(option) => option.name}
        />
        and
        <Autocomplete
          id="driver2"
          placeholder="Select a driver..."
          onChange={(_, value) => setDriver2(value)}
          options={drivers}
          autoSelect
          autoHighlight
          getOptionLabel={(option) => option.name}
        />
        {loadingDegrees ? (
          <CircularProgress />
        ) : pairings?.length ? (
          <DegreesOfSeparation id="degreesOfSeparation" pairings={pairings} />
        ) : driver1 && driver2 ? (
          "There is no connection"
        ) : (
          ""
        )}
      </Card>
    </>
  );
};

export default App;
