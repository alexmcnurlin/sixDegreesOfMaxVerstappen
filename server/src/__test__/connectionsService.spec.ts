import { ConnectionsService } from "../connectionsService";

test("can load driver pairings", () => {
  const actual = ConnectionsService.loadDriverPairings([
    {
      id: "1",
      name: "first",
      teammates: ["2"],
    },
  ]);

  expect(actual.length).toBe(1);
});
