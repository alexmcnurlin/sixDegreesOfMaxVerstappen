import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import "./App.css";
import { Autocomplete, Card } from "@mui/joy";

const GET_DRIVERS = gql`
  query GetDrivers {
    drivers {
      id
      firstName
      lastName
    }
  }
`;

const GET_DEGREES = gql`
  query GetDegreesOfSeparation($driver1: String, $driver2: String) {
    degreesOfSeparation(driver1: $driver1, driver2: $driver2) {
      id
      firstName
      lastName
    }
  }
`;

type Driver = {
  id: string;
  firstName: string;
  lastName: string;
};

const App = () => {
  const { data: driverData } = useQuery(GET_DRIVERS);

  const [driver1, setDriver1] = useState<Driver | null>();
  const [driver2, setDriver2] = useState<Driver | null>();

  const {
    data: degreesData,
    loading,
    error,
  } = useQuery(GET_DEGREES, {
    variables: {
      driver1: driver1?.id ?? "",
      driver2: driver2?.id ?? "",
    },
  });

  const result = degreesData?.degreesOfSeparation
    ?.map((d) => `${d.firstName} ${d.lastName}`)
    ?.join(" -> ");

  console.log(loading + " " + JSON.stringify(degreesData));
  console.log(error);

  // console.log("Data: " + JSON.stringify(data))
  // console.log("Error: " + JSON.stringify(error))
  // console.log("Loading: " + JSON.stringify(loading))
  // console.log("DataState: " + JSON.stringify(dataState))

  const drivers: Driver[] = driverData?.drivers ?? [];

  // TODO: Why is the theme still light?
  // const { mode, systemMode } = useColorScheme();
  // console.log(mode); // "system"
  // console.log(systemMode); // "light" |

  return (
    <>
      <Card>
        How many degrees of separation are between
        <Autocomplete
          onChange={(_, value) => setDriver1(value)}
          options={drivers}
          placeholder="Max Verstappen"
          getOptionLabel={(option) => option.firstName + " " + option.lastName}
        />
        and
        <Autocomplete
          onChange={(_, value) => setDriver2(value)}
          options={drivers}
          placeholder="..."
          getOptionLabel={(option) => option.firstName + " " + option.lastName}
        />
        {result}
      </Card>
    </>
  );
};

export default App;
