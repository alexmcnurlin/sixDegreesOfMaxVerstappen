// We don't have any codegen set up to provide the types for our queries, so
// lets manually recreate them here.
export type Driver = {
  id: string;
  name: string;
};

export type Pairing = {
  driver1: Driver;
  driver2: Driver;
  dates: GrandPrixRange[];
};

export type GrandPrixRange = {
  startRace: string;
  startDate: string;
  endRace: string;
  endDate: string;
};
