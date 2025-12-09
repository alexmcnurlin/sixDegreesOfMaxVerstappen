import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { drivers } from './drivers.js';
import { typeDefs } from './schema.js';

console.log("hello world")

const resolvers = {
    Query: {
        drivers() {
            return drivers
        },
        degreesOfSeparation(parent, args, contextValue, info) {
            // TODO: Get the real data
            console.log(args)
            return drivers.filter(d => d.id == args.driver1 || d.id == args.driver2)
        }
    },
    Driver: {
        teammates(parent) {
            console.log("Sup")
            // TODO: This is NOT efficient. Turn drivers into a dictionary, keyed by ID
            // return parent.teammates.filter(tm => drivers.find(d => d.id == tm));
            return undefined;
        },
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 5172 },
});

console.log(`🚀  Server ready at: ${url}`);
