import { Page, Route } from "@playwright/test";

// GQL variables the request was called with.
// Useful to validate the API was called correctly.
type CalledWith = Record<string, unknown>;

/**
 * Registers a client-side interception to our BFF (presumes all `graphql`
 * requests are to us). Interceptions are per-operation, so multiple can be
 * registered for different operations without overwriting one-another.
 *
 * Taken from https://www.jayfreestone.com/writing/stubbing-graphql-playwright/
 */
export async function interceptGql(
  page: Page,
  operationName: string,
  resp: any
): Promise<CalledWith[]> {
  // A list of GQL variables which the handler has been called with.
  const reqs: CalledWith[] = [];

  // Register a new handler which intercepts all GQL requests.
  await page.route("http://localhost:5172/", function (route: Route) {
    const req = route.request().postDataJSON();

    // Pass along to the previous handler in the chain if the request
    // is for a different operation.
    if (req.operationName !== operationName) {
      return route.fallback();
    }

    // Store what variables we called the API with.
    reqs.push(req.variables);

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: resp }),
    });
  });

  return reqs;
}
