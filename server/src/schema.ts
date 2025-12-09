export const typeDefs = `#graphql
  type Driver {
    id: String
    firstName: String
    lastName: String
    teammates: [Driver!]!
  }
  type Query {
    drivers: [Driver]
    degreesOfSeparation(driver1: String, driver2: String): [Driver]
  }
`;
