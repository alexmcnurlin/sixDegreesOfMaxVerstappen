import { ConnectionsService } from "../connectionsService";

test("can load one driver pairing", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: ["2"],
    },
    {
      id: "2",
      name: "second",
      teammates: [],
    },
  ]);

  expect(actual).toEqual([
    {
      driver1: "1",
      driver2: "2",
      dates: [],
    },
  ]);
});

test("can load multiple driver pairings for one driver", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: ["2", "3"],
    },
    {
      id: "2",
      name: "second",
      teammates: [],
    },
    {
      id: "3",
      name: "third",
      teammates: [],
    },
  ]);

  expect(actual).toEqual([
    {
      driver1: "1",
      driver2: "2",
      dates: [],
    },
    {
      driver1: "1",
      driver2: "3",
      dates: [],
    },
  ]);
});

test("can load multiple driver pairings for multiple drivers", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: ["2", "3"],
    },
    {
      id: "2",
      name: "second",
      teammates: ["3"],
    },
    {
      id: "3",
      name: "third",
      teammates: [],
    },
  ]);

  expect(actual).toEqual([
    {
      driver1: "1",
      driver2: "2",
      dates: [],
    },
    {
      driver1: "1",
      driver2: "3",
      dates: [],
    },
    {
      driver1: "2",
      driver2: "3",
      dates: [],
    },
  ]);
});

test("Pairings are symmetric when the data is symmetric", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: ["2"],
    },
    {
      id: "2",
      name: "second",
      teammates: ["1"],
    },
  ]);

  expect(actual).toEqual([
    {
      driver1: "1",
      driver2: "2",
      dates: [],
    },
    {
      driver1: "2",
      driver2: "1",
      dates: [],
    },
  ]);
});

test("getPath results are not symmetric when the data is not symmetric", () => {
  // This is not necessarily desired behavior, but the algorithm we use to
  // detect the path lets us do it.
  const drivers = [
    {
      id: "1",
      name: "first",
      teammates: ["2"],
    },
    {
      id: "2",
      name: "second",
      teammates: ["3"],
    },
    {
      id: "3",
      name: "third",
      teammates: ["1"],
    },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getMap = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    pairings
  );

  const expected1 = getMap("1", "2");
  const expected2 = getMap("2", "1");

  expect(expected1.length).toBe(1);
  expect(expected2.length).toBe(2);
});

test("getPath lets you get the path between two drivers", () => {
  const drivers = [
    { id: "1", name: "first", teammates: ["2"] },
    { id: "2", name: "second", teammates: ["1"] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    pairings
  );

  const path = getPath("1", "2");

  expect(path).toEqual([
    {
      driver1: "1",
      driver2: "2",
      dates: [],
    },
  ]);
});

test("getPath will be in reverse for reverse order", () => {
  const drivers = [
    { id: "1", name: "first", teammates: ["2"] },
    { id: "2", name: "second", teammates: ["1"] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    pairings
  );

  const path = getPath("2", "1");

  expect(path).toEqual([
    {
      driver1: "2",
      driver2: "1",
      dates: [],
    },
  ]);
});

test("getPath returns empty array for same id", () => {
  const drivers = [
    { id: "1", name: "first", teammates: ["2"] },
    { id: "2", name: "second", teammates: ["1"] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    pairings
  );

  const path = getPath("1", "1");

  expect(path).toEqual([]);
});

test("getPath returns null if no path", () => {
  const drivers = [
    { id: "1", name: "first", teammates: [] },
    { id: "2", name: "second", teammates: [] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    pairings
  );

  const path = getPath("1", "2");

  expect(path).toBe(null);
});

test("getPath gets the path when we have many drivers", () => {
  const drivers = [
    { id: "1", name: "first", teammates: ["2"] },
    { id: "2", name: "second", teammates: ["1", "3", "4"] },
    { id: "3", name: "third", teammates: ["2", "4"] },
    { id: "4", name: "fourth", teammates: ["2", "3", "5"] },
    { id: "5", name: "fifth", teammates: ["5"] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    pairings
  );

  const path = getPath("1", "5");

  expect(path).toEqual([
    {
      driver1: "1",
      driver2: "2",
      dates: [],
    },
    {
      driver1: "2",
      driver2: "4",
      dates: [],
    },
    {
      driver1: "4",
      driver2: "5",
      dates: [],
    },
  ]);
});
