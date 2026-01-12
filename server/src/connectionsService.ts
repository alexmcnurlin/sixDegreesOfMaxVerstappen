import { DriverDto, PairingDto } from "./dtoTypes";

export class ConnectionsService {
  /**
   * Load the given json file into the driver data we want to use.
   *
   * Since our data is relatively small, and doesn't need fast/random access,
   * we're storing the data in an object. If we need anything more complex, we
   * should use a proper database.
   */
  static loadDriverData(drivers: DriverDto[]): Map<string, DriverDto> {
    return new Map(drivers.map((d) => [d.id, d]));
  }

  /**
   * Maps the driver data into an object that represents all teammate pairings
   *
   * Each pairing should show up twice (I.e. Max was teammates with Carlos, AND
   * Carlos was teammates with Max)
   */
  static loadDriverPairings(data: DriverDto[]): Map<string, PairingDto> {
    return new Map(
      data
        .flatMap((d) =>
          // Map TeammateDto[] to PairingDto[]
          d.teammates.map((tm) => ({
            driver1: d.id,
            driver2: tm.id,
            dates: tm.dates,
          }))
        )
        .map((p) => [`${p.driver1}+${p.driver2}`, p])
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
  static buildDegreesOfSeparationMap(
    drivers: DriverDto[],
    pairings: PairingDto[]
  ) {
    const length = drivers.length;
    const indexMap: Record<string, number> = {};
    drivers.forEach(({ id }, i) => (indexMap[id] = i));
    const degrees: number[][] = Array.from({ length: length }, () =>
      Array.from({ length: length }, () => Infinity)
    );
    const pathMap: PairingDto[][] = Array.from({ length: length }, () =>
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
    for (let k = 0; k < length; k++) {
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
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
      const path: PairingDto[] = [];
      while (u != v) {
        const p = pathMap[u][v];
        path.unshift(p);
        v = indexMap[p.driver1];
      }
      return path;
    };

    const flatMap = degrees.flatMap((d) => d);
    const maximum = flatMap
      .filter((d) => d != Infinity)
      .reduce((prev, curr) => Math.max(prev, curr));
    console.log(`Largest Separation: ${maximum}`);
    degrees.forEach((di, i) => {
      di.forEach((dj, j) => {
        if (dj == maximum) {
          console.log(`   * ${drivers[i].name} -> ${drivers[j].name}`);
        }
      });
    });
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
}
