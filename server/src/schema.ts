export const typeDefs = `#graphql
  type Driver {
    id: String!
    name: String!
    teammates: [Pairing!]!
  }

  type Pairing {
    driver1: Driver!
    driver2: Driver!
    dates: [DateRange!]!
  }

  type DateRange {
    start: String!
    end: String!
  }

  type Query {
    drivers: [Driver!]!
    degreesOfSeparation(driver1: String, driver2: String): [Pairing!]!
  }
`;
