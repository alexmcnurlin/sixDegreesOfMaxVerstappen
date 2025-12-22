import fs from "fs";

// TODO: Should we move these types to their own folder?
type Driver = {
  id: string;
  name: string;
  teammates: Teammate[];
};

type Teammate = {
  id: string;
  startDate: number;
  startRace: number;
  endDate: number;
  endRace: number;
};

type Pairing = {
  driver1: string;
  driver2: string;
  dates: GrandPrixRange[];
};

type GrandPrixRange = {
  startDate: number;
  startRace: number;
  endDate: number;
  endRace: number;
};

export class ConnectionsService {
  /**
   * Load the given json file into the driver data we want to use.
   *
   * Since our data is relatively small, and doesn't need fast/random access,
   * we're storing the data in an object. If we need anything more complex, we
   * should use a proper database.
   */
  static loadDriverData(path: string) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  }

  /**
   * Maps the driver data into an object that represents all teammate pairings
   *
   * Each pairing should show up twice (I.e. Max was teammates with Carlos, AND
   * Carlos was teammates with Max)
   */
  static loadDriverPairings(data: Driver[]): Pairing[] {
    return data.flatMap((d) =>
      // Collapse the Driver.Teammate[] into Pairing[]
      Object.entries(
        // Each teammate can show up multiple times. Map those multiple entries
        // into a single Pairing I.e. Daniel Ricciardo was teammates with Yuki
        // Tsunoda for a few races in 2023, then again in 2024
        ConnectionsService.groupBy(d.teammates, (tm) => tm.id)
      ).map((value) => ({
        driver1: d.id,
        driver2: value[0],
        dates: value[1].map((tm) => tm as GrandPrixRange),
      }))
    );
  }

  /**
   * Build an arrays that will map out the number of degrees between any two
   * drivers, and the path between them.
   *
   * The map is built using the Floyd-Warshall algorithm with path
   * reconstruction described here
   * https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm#Path_reconstruction
   */
  static buildDegreesOfSeparationMap(drivers: Driver[], pairings: Pairing[]) {
    const length = drivers.length;
    const indexMap: Record<string, number> = {};
    drivers.forEach(({ id }, i) => (indexMap[id] = i));
    const degrees: number[][] = Array.from({ length: length }, () =>
      Array.from({ length: length }, () => Infinity)
    );
    const pathMap: Pairing[][] = Array.from({ length: length }, () =>
      Array.from({ length: length }, () => null)
    );

    // Initialze the weights
    pairings.forEach((p) => {
      const u = indexMap[p.driver1];
      const v = indexMap[p.driver2];
      degrees[u][v] = 1;
      pathMap[u][v] = p;
    });
    drivers.forEach((d) => {
      const v = indexMap[d.id];
      degrees[v][v] = 0;
    });

    // Run the Floyd-Warshall algorithm
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        for (let k = 0; k < length; k++) {
          if (degrees[i][j] > degrees[i][k] + degrees[k][j]) {
            degrees[i][j] = degrees[i][k] + degrees[k][j];
            pathMap[i][j] = pathMap[k][j];
          }
        }
      }
    }

    const getPath = (start: string, end: string) => {
      const u = indexMap[start];
      let v = indexMap[end];
      if (start == end) {
        return [];
      }
      if (pathMap[u][v] == null) {
        return null;
      }
      const path = [];
      while (u != v) {
        const p = pathMap[u][v];
        path.unshift(p);
        v = indexMap[p.driver1];
      }
      return path;
    };

    const flatMap = degrees.flatMap((d) => d);
    console.log(
      `Largest Separation: ${flatMap
        .filter((d) => d != Infinity)
        .reduce((prev, curr) => Math.max(prev, curr))}`
    );
    console.log(
      `Average: ${
        flatMap
          .filter((d) => d != Infinity)
          .reduce(
            (previousValue, currentValue) => previousValue + currentValue
          ) / flatMap.length
      }`
    );
    console.log(
      `Number of broken links: ${flatMap.filter((d) => d == 0).length}`
    );

    return getPath;
  }

  /**
   * Groups objects by a key. Returns a record of key and all items with that key.
   *
   * Taken from StackOverflow https://stackoverflow.com/questions/42136098/array-groupby-in-typescript
   */
  static groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
    arr.reduce((groups, item) => {
      (groups[key(item)] ||= []).push(item);
      return groups;
    }, {} as Record<K, T[]>);
}
