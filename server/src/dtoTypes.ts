export type DriverDto = {
  id: string;
  name: string;
  teammates: TeammateDto[];
};

export type TeammateDto = {
  id: string;
  dates: GrandPrixRangeDto[];
};

export type PairingDto = {
  driver1: string;
  driver2: string;
  dates: GrandPrixRangeDto[];
};

export type GrandPrixRangeDto = {
  startDate: string;
  startRace: string;
  startUrl: string;
  count: number;
  endDate: string;
  endRace: string;
  endUrl: string;
};
