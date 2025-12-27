import { ConnectionsService } from "../connectionsService";

test("can load one driver pairing", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: [{ id: "2", dates: [] }],
    },
    {
      id: "2",
      name: "second",
      teammates: [],
    },
  ]);

  expect(actual).toEqual(
    new Map(
      Object.entries({
        "1+2": {
          driver1: "1",
          driver2: "2",
          dates: [],
        },
      })
    )
  );
});

test("can load multiple driver pairings for one driver", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: [
        { id: "2", dates: [] },
        { id: "3", dates: [] },
      ],
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

  expect(actual).toEqual(
    new Map(
      Object.entries({
        "1+2": {
          driver1: "1",
          driver2: "2",
          dates: [],
        },
        "1+3": {
          driver1: "1",
          driver2: "3",
          dates: [],
        },
      })
    )
  );
});

test("can load multiple driver pairings for multiple drivers", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: [
        { id: "2", dates: [] },
        { id: "3", dates: [] },
      ],
    },
    {
      id: "2",
      name: "second",
      teammates: [{ id: "3", dates: [] }],
    },
    {
      id: "3",
      name: "third",
      teammates: [],
    },
  ]);

  expect(actual).toEqual(
    new Map(
      Object.entries({
        "1+2": {
          driver1: "1",
          driver2: "2",
          dates: [],
        },
        "1+3": {
          driver1: "1",
          driver2: "3",
          dates: [],
        },
        "2+3": {
          driver1: "2",
          driver2: "3",
          dates: [],
        },
      })
    )
  );
});

test("Pairings are symmetric when the data is symmetric", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: [{ id: "2", dates: [] }],
    },
    {
      id: "2",
      name: "second",
      teammates: [{ id: "1", dates: [] }],
    },
  ]);

  expect(actual).toEqual(
    new Map(
      Object.entries({
        "1+2": {
          driver1: "1",
          driver2: "2",
          dates: [],
        },
        "2+1": {
          driver1: "2",
          driver2: "1",
          dates: [],
        },
      })
    )
  );
});

test("getPath results are not symmetric when the data is not symmetric", () => {
  // This is not necessarily desired behavior, but the algorithm we use to
  // detect the path lets us do it.
  const drivers = [
    {
      id: "1",
      name: "first",
      teammates: [{ id: "2", dates: [] }],
    },
    {
      id: "2",
      name: "second",
      teammates: [{ id: "3", dates: [] }],
    },
    {
      id: "3",
      name: "third",
      teammates: [{ id: "1", dates: [] }],
    },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getMap = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    Array.from(pairings.values())
  );

  const expected1 = getMap("1", "2");
  const expected2 = getMap("2", "1");

  expect(expected1.length).toBe(1);
  expect(expected2.length).toBe(2);
});

test("getPath lets you get the path between two drivers", () => {
  const drivers = [
    { id: "1", name: "first", teammates: [{ id: "2", dates: [] }] },
    { id: "2", name: "second", teammates: [{ id: "1", dates: [] }] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    Array.from(pairings.values())
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
    { id: "1", name: "first", teammates: [{ id: "2", dates: [] }] },
    { id: "2", name: "second", teammates: [{ id: "1", dates: [] }] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    Array.from(pairings.values())
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
    { id: "1", name: "first", teammates: [{ id: "2", dates: [] }] },
    { id: "2", name: "second", teammates: [{ id: "1", dates: [] }] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    Array.from(pairings.values())
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
    Array.from(pairings.values())
  );

  const path = getPath("1", "2");

  expect(path).toBe(null);
});

test("getPath gets the path when we have many drivers", () => {
  const drivers = [
    { id: "1", name: "first", teammates: [{ id: "2", dates: [] }] },
    {
      id: "2",
      name: "second",
      teammates: [
        { id: "1", dates: [] },
        { id: "3", dates: [] },
        { id: "4", dates: [] },
      ],
    },
    {
      id: "3",
      name: "third",
      teammates: [
        { id: "2", dates: [] },
        { id: "4", dates: [] },
      ],
    },
    {
      id: "4",
      name: "fourth",
      teammates: [
        { id: "2", dates: [] },
        { id: "3", dates: [] },
        { id: "5", dates: [] },
      ],
    },
    { id: "5", name: "fifth", teammates: [{ id: "5", dates: [] }] },
  ];
  const pairings = ConnectionsService.loadDriverPairings(drivers);
  const getPath = ConnectionsService.buildDegreesOfSeparationMap(
    drivers,
    Array.from(pairings.values())
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
