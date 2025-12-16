import { drivers } from "./drivers";

// TODO: Should we move these types to their own folder?
type Driver = (typeof drivers)[0];
type Pairing = {
  driver1: string;
  driver2: string;
  dates: DateRange[];
};

type DateRange = {
  start: number;
  end: number;
};

export class ConnectionsService {
  /**
   * Load the given json file into the driver data we want to use.
   *
   * Since our data is relatively small, and doesn't need fast/random access,
   * we're storing the data in an object. If we need anything more complex, we
   * should use a proper database.
   */
  static loadDriverData(data: any) {
    return drivers;
  }

  static loadDriverPairings(data: Driver[]): Pairing[] {
    return data.flatMap((d) =>
      d.teammates.map((tm) => ({
        driver1: d.id,
        driver2: tm,
        dates: [
          {
            start: 1234,
            end: 5678,
          },
        ],
      }))
    );
  }
}
