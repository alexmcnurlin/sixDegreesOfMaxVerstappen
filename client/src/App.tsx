import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import "./App.css";
import {
  Autocomplete,
  Card,
  CircularProgress,
  Typography,
  useColorScheme,
} from "@mui/joy";
import type { Maybe } from "graphql/jsutils/Maybe";
import type { Driver, GrandPrixRange, Pairing } from "./Types";
import DegreesOfSeparation from "./DegreesOfSeparation";

const GET_DRIVERS = gql`
  query GetDrivers {
    drivers {
      id
      name
    }
  }
`;

const GET_DEGREES = gql`
  query GetDegreesOfSeparation($driver1: String, $driver2: String) {
    degreesOfSeparation(driver1: $driver1, driver2: $driver2) {
      driver1 {
        name
      }
      driver2 {
        name
      }
      dates {
        startDate
        startRace
        endDate
        endRace
      }
    }
  }
`;

const App = () => {
  const { data: driverData, loading: loadingDrivers } = useQuery(GET_DRIVERS);
  const drivers: Driver[] = driverData?.drivers ?? [];

  const max = drivers.find((d) => d.name === "Max Verstappen");

  const [driver1, setDriver1] = useState<Maybe<Driver>>();
  const [driver2, setDriver2] = useState<Maybe<Driver>>();

  useEffect(() => {
    if (!driver1 && drivers) {
      setDriver1(max);
    }
  }, [drivers, driver1]);

  const {
    data: degreesData,
    error,
    loading: loadingDegrees,
  } = useQuery(GET_DEGREES, {
    variables: {
      driver1: driver1?.id ?? "",
      driver2: driver2?.id ?? "",
    },
    skip: !driver1 || !driver2,
  });

  const pairings: Pairing[] = degreesData?.degreesOfSeparation;
  const result =
    error?.message ||
    pairings?.map((p) => (
      <div>
        {p.driver1.name} was teammates with {p.driver2.name}{" "}
        {formatDateRange(p.dates)}
      </div>
    ));

  // TODO: Why is the theme still light?
  // const { mode, systemMode } = useColorScheme();
  // console.log(mode); // "system"
  // console.log(systemMode); // "light" |

  console.log(JSON.stringify(pairings));

  return loadingDrivers ? (
    <CircularProgress />
  ) : (
    <>
      <span id="description">
        <Typography>
          {"You may be familiar with the "}
          <a href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon">
            Six Degrees of Kevin Bacon
          </a>
          - Most actors can be connected to Kevin Bacon by less than six steps.
          I.e. they were in a movie with someone who was in a movie with Kevin
          Bacon.
        </Typography>
        <br />
        <Typography>
          Lets apply that idea to Formula 1 drivers! Drivers are connected if
          they were teammates at any point (even one race). Max was teammates
          with Carlos Sainz Jr. (Toro Rosso, 2015), who was teammates with Lando
          Norris (McLaren, 2019). This means that Lando has 2 degrees of
          separation from Max!
        </Typography>
      </span>

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
          <DegreesOfSeparation pairings={pairings} />
        ) : (
          <></>
        )}
      </Card>
    </>
  );
};

const formatDateRange = (dates: GrandPrixRange[]) => {
  // This lets the UI look good before we populate the date data
  // TODO: Remove this
  if (dates.length == 0) {
    return "at some point";
  }
  if (dates.length === 1 && dates[0].startDate == dates[0].endDate) {
    return `for ${dates[0].startDate}`;
  }
  return `from ${dates.map((d) => `${d.startDate}-${d.endDate}`).join(",")}`;
};

export default App;
