import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import { ConnectionsService } from "./connectionsService";

console.log("Loading driver data...");
const drivers = ConnectionsService.loadDriverData("./drivers.json");
console.log(`-> Loaded ${drivers.length} drivers!`);
console.log("Loading driver pairings data...");
const pairings = ConnectionsService.loadDriverPairings(drivers);
console.log(`-> Loaded ${pairings.length} pairings!`);

console.log("Building Degrees of Separation Map");
console.time("-> Build Degrees of Separation Map in");
const getPath = ConnectionsService.buildDegreesOfSeparationMap(
  drivers,
  pairings
);
console.timeEnd("-> Build Degrees of Separation Map in");

const resolvers = {
  Query: {
    drivers() {
      return drivers;
    },
    degreesOfSeparation(parent, args, contextValue, info) {
      return getPath(args.driver1, args.driver2);
    },
  },
  Driver: {
    teammates(parent) {
      // TODO: This is NOT efficient. Turn drivers into a dictionary, keyed by ID
      return pairings.filter((p) => parent.id === p.driver1);
    },
  },
  Pairing: {
    driver1(parent) {
      return drivers.find((d) => d.id == parent.driver1);
    },
    driver2(parent) {
      return drivers.find((d) => d.id == parent.driver2);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 5172 },
}).then(({ url }) => {
  console.log(`🚀  Server reay at: ${url}`);
});
