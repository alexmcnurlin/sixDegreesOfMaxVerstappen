export const typeDefs = `#graphql
  type Driver {
    id: String!
    name: String!
    teammates: [Teammate!]!
  }

  type Teammate {
    id: Driver!
    dates: [GrandPrixRange!]!
  }

  type Pairing {
    driver1: Driver!
    driver2: Driver!
    dates: [GrandPrixRange!]!
  }

  type GrandPrixRange {
    startName: String
    startDate: String
    endName: String
    endDate: String
  }

  type Query {
    drivers: [Driver!]!
    degreesOfSeparation(driver1: String, driver2: String): [Pairing!]!
  }
`;
