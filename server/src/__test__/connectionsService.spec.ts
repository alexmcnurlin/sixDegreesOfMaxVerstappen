import { ConnectionsService } from "../connectionsService";

test("can load driver pairings", () => {
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
      dates: [{ start: 1234, end: 5678 }],
    },
  ]);
});
