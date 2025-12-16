import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import { ConnectionsService } from "./connectionsService";

console.log("Loading driver data...");
const drivers = ConnectionsService.loadDriverData(null);
console.log(`-> Loaded ${drivers.length} drivers!`);
console.log("Loading driver pairings data...");
const pairings = ConnectionsService.loadDriverPairings(drivers);
console.log(`-> Loaded ${pairings.length} pairings!`);

const resolvers = {
  Query: {
    drivers() {
      return drivers;
    },
    degreesOfSeparation(parent, args, contextValue, info) {
      // TODO: Get the real data
      console.log(args);
      return pairings.filter(
        (p) => args.driver1 === p.driver1 || args.driver === p.driver2
      );
    },
  },
  Driver: {
    teammates(parent) {
      console.log("Sup");
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
