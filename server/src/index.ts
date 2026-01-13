import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import cors from "cors";
import express from "express";
import http from "http";
import config from "./config.json";
import drivers from "./drivers.json";
import { Driver, Resolvers } from "./gql";
import { ConnectionsService } from "./connectionsService";
import { DriverDto, PairingDto } from "./dtoTypes";
import path from "path";

export interface MyContext {
  drivers: Map<string, DriverDto>;
  pairings: Map<string, PairingDto>;
  getDriver: (id: string) => Driver;
  driversList: DriverDto[];
}

console.log("Loading driver data...");
const driversMap = ConnectionsService.loadDriverData(drivers as DriverDto[]);
const sortFunc = (d: DriverDto) =>
  d.teammates
    .flatMap((tm) => tm.dates)
    .reduce((prev, date) => date.count + prev, 0);
// Sort the drivers by the total number of races. This will put more well-known
// drivers at the top.
const driversList = Array.from(driversMap.values()).toSorted(
  (d1, d2) => sortFunc(d2) - sortFunc(d1)
);
console.log(`-> Loaded ${driversMap.size} drivers!`);

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

// Fufill our api endpoints.
const resolvers: Resolvers<MyContext> = {
  Query: {
    drivers(parent, args, contextValue, info) {
      return contextValue.driversList.map((d) => contextValue.getDriver(d.id));
    },
    degreesOfSeparation(parent, args, contextValue, info) {
      const retval = getPath(args.driver1, args.driver2);
      return retval?.map((p) => ({
        driver1: contextValue.getDriver(p.driver1),
        driver2: contextValue.getDriver(p.driver2),
        dates: p.dates,
      }));
    },
  },
  // For any endpoint returning the `Driver` type, fill in the `teammates` field
  // based on the other fields.
  Driver: {
    teammates(parent, args, contextValue, info) {
      const driver = contextValue.drivers.get(parent.id);
      return driver.teammates
        .map((tm) => contextValue.pairings.get(`${driver.id}+${tm.id}`))
        .map((p) => ({
          driver: contextValue.getDriver(p.driver2),
          dates: p.dates,
        }));
    },
  },
};

// Configure the graphql server
const schemaPath = path.join(__dirname, "./schema.graphql");
loadSchema(schemaPath, {
  loaders: [new GraphQLFileLoader()],
}).then(async (typeDefs) => {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  const corsAllowUrls = config["clientDomain"].map((d) =>
    d.includes("localhost")
      ? `${config["clientDomain"]}:${config["clientPort"]}`
      : config["clientDomain"]
  );

  app.use(
    config["serverRoute"],
    cors<cors.CorsRequest>({
      // Only allow requests from our client, or the apollo graphql studio
      origin: [...corsAllowUrls, "https://studio.apollographql.com"],
    }),
    express.json(),
    expressMiddleware(server, {
      context: async () => ({
        drivers: driversMap,
        pairings: pairings,
        driversList: driversList,
        getDriver: (id: string) => {
          const driver = driversMap.get(id);
          return {
            id: id,
            name: driver.name,
            url: driver.url,
          };
        },
      }),
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: config["serverPort"] }, resolve)
  );
  console.log(
    `🚀 Server ready at ${config["serverDomain"]}:${config["serverPort"]}${config["serverRoute"]}`
  );
});
