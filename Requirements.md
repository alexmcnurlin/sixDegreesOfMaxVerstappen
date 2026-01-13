# Design

## Frontend

The User interface must:

- Give a description of the idea of the six degrees concept
- Show two input boxes, where the user can type in the name of a F1 driver
- (stretch goal) A third box will give the option to configure when two drivers are connected
  - Started a race as teammates
  - Finished a race as teammates
  - ❌ Raced a season as teammates (50% of races started together)
- When the user types into either input box, a list of matching drivers is listed.
- When both boxes are populated, the results will be presented instantly
- The "results" must include the following
  - [Driver1] is separated from [Driver2] with [N] degrees of separation
  - [Driver1] was teammates with [DriverN] for [Number] races ([TimePeriod])
  - [DriverN] was teammates with [DriverN+1] for [Number] races ([TimePeriod])
  - [DriverN+1] was teammates with [Driver2] for [Number] races ([TimePeriod])

## Backend

The back end must

- Have a list in JSON of all available drivers, with the following data
  - A unique ID for that driver made of their first/last name. I.e. MaxVerstappen. (There aren't duplicate names, so we don't need to disambiguate yet)
  - A dictionary, where each key is the connection criteria, and each value is a list of "Pairing"s, which includes
    - A unique ID
    - The ID's of both drivers
    - The years those drivers were teammates (StartYear-EndYear, StartYear2-EndYear2)
    - The first race that they were teammates
- When the server starts, load the data in the above JSON file and compute a list of teammate pairings using the Floyd-Warshall algorithm, modified to store the path for each route.
  - I chose to pre-compute the list of pairings, since there's only been ~750 drivers in the history of F1. This is manageable to precompute and store in-memory. Storage space would be N^2*I*L where I is the length of each ID, and L is the average number of connections. With I=L=10 (a rough estimate), that's 51mb of storage. Once implemented, if this is too much, we can switch to calculating on the fly, and cache our results

The API must have endpoints to:

- Query all available drivers
- Given two drivers, get the connections between them.
- ❌ Query the average number of connections for a given driver.

## Tests

- Each line of the above specification must be tested as a unique test case.
