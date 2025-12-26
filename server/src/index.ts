import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ConnectionsService } from "./connectionsService";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { Driver, Resolvers } from "../gql";
import { DriverDto, PairingDto } from "./dtoTypes";

export interface MyContext {
  drivers: Map<string, DriverDto>;
  pairings: Map<string, PairingDto>;
  getDriver: (id: string) => Driver;
  driversList: DriverDto[];
}

console.log("Loading driver data...");
const drivers = ConnectionsService.loadDriverData("./drivers.json");
const driversList = Array.from(drivers.values());
console.log(`-> Loaded ${drivers.size} drivers!`);

console.log("Loading driver pairings data...");
const pairings = ConnectionsService.loadDriverPairings(driversList);
const pairingsList = Array.from(pairings.values());
console.log(`-> Loaded ${pairings.size} pairings!`);

console.log("Building Degrees of Separation Map");
console.time("-> Build Degrees of Separation Map in");
const getPath = ConnectionsService.buildDegreesOfSeparationMap(
  driversList,
  pairingsList
);
console.timeEnd("-> Build Degrees of Separation Map in");

const resolvers: Resolvers<MyContext> = {
  Query: {
    drivers(parent, args, contextValue, info) {
      return contextValue.driversList.map((d) => contextValue.getDriver(d.id));
    },
    degreesOfSeparation(parent, args, contextValue, info) {
      const retval = getPath(args.driver1, args.driver2);
      return retval.map((p) => ({
        driver1: contextValue.getDriver(p.driver1),
        driver2: contextValue.getDriver(p.driver2),
        dates: p.dates,
      }));
    },
  },
  Driver: {
    teammates(parent, args, contextValue, info) {
      const driver = contextValue.drivers.get(parent.id);
      const pairings = driver.teammates.map((tm) =>
        contextValue.pairings.get(`${driver.id}+${tm.id}`)
      );
      return pairings.map((p) => ({
        driver: contextValue.getDriver(p.driver2),
        dates: p.dates,
      }));
    },
  },
};

loadSchema("../shared/schema.graphql", {
  loaders: [new GraphQLFileLoader()],
})
  .then((typeDefs) => {
    const server = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });

    return startStandaloneServer(server, {
      context: async () => ({
        drivers: drivers,
        pairings: pairings,
        driversList: driversList,
        getDriver: (id: string) => ({
          id: id,
          name: drivers.get(id).name,
        }),
      }),
      listen: { port: 5172 },
    });
  })
  .then(({ url }) => {
    console.log(`🚀  Server reay at: ${url}`);
  });
