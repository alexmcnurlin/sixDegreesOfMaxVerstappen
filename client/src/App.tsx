import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import "./App.css";
import { Autocomplete, Card, useColorScheme } from "@mui/joy";
import type { Maybe } from "graphql/jsutils/Maybe";

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
        start
        end
      }
    }
  }
`;

// We don't have any codegen set up to provide the types for our queries, so
// lets manually recreate them here.
type Driver = {
  id: string;
  name: string;
};

type Pairing = {
  driver1: Driver;
  driver2: Driver;
  dates: DateRange[];
};

type DateRange = {
  start: number;
  end: number;
};

const App = () => {
  const { data: driverData } = useQuery(GET_DRIVERS);
  const drivers: Driver[] = driverData?.drivers ?? [];

  const [driver1, setDriver1] = useState<Maybe<Driver>>();
  const [driver2, setDriver2] = useState<Maybe<Driver>>();

  const {
    data: degreesData,
    loading,
    error,
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
    pairings
      ?.map(
        (p) =>
          `${p.driver1.name} was teammates with ${
            p.driver2.name
          } ${formatDateRange(p.dates)}`
      )
      ?.join(" \n\n ");

  // TODO: Why is the theme still light?
  // const { mode, systemMode } = useColorScheme();
  // console.log(mode); // "system"
  // console.log(systemMode); // "light" |

  return (
    <>
      <Card>
        How many degrees of separation are between
        <Autocomplete
          onChange={(_, value) => setDriver1(value ?? undefined)}
          options={drivers}
          placeholder="Max Verstappen"
          getOptionLabel={(option) => option.name}
        />
        and
        <Autocomplete
          onChange={(_, value) => setDriver2(value)}
          options={drivers}
          placeholder="..."
          getOptionLabel={(option) => option.name}
        />
        {result}
      </Card>
    </>
  );
};

const formatDateRange = (dates: DateRange[]) => {
  if (dates.length === 1 && dates[0].start == dates[0].end) {
    return `for ${dates[0].start}`;
  }
  return `from ${dates.map((d) => `${d.start}-${d.end}`).join(",")}`;
};

export default App;
