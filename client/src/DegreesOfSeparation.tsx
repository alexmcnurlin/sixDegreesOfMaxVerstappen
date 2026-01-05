import { Fragment, memo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Link,
  Typography,
} from "@mui/joy";
import { Maybe, GetDegreesOfSeparationQuery } from "./gql/graphql";

type Pairing = GetDegreesOfSeparationQuery["degreesOfSeparation"][0];
type Data = NonNullable<Pairing["dates"]>[0];

interface DegreesOfSeparationProps {
  id: string;
  pairings: Pairing[];
}

const DegreesOfSeparation = ({ pairings, id }: DegreesOfSeparationProps) => {
  return (
    <span id={id}>
      {pairings.length == 1
        ? "1 degree of separation:"
        : `${pairings.length} degrees of separation:`}
      <AccordionGroup transition="0.2s ease">
        <Accordion key={`${pairings[0].driver1.id}-accordion`} disabled>
          <AccordionSummary
            id={`driver-${pairings[0].driver1.id}-accordion-summary`}
            key={`driver-${pairings[0].driver1.id}-accordion-summary`}
            indicator={<></>}
          >
            {`0) ${pairings[0].driver1.name}`}
          </AccordionSummary>
        </Accordion>
        {pairings.map((p, i) => (
          <Accordion key={i}>
            <AccordionSummary
              id={`driver-${p.driver2.id}-accordion-summary`}
              key={`driver-${p.driver2.id}-accordion-summary`}
            >
              {`${i + 1}) ${p.driver2.name} (${p.dates?.reduce(
                (prev, curr) => prev + curr.count,
                0
              )} races)`}
            </AccordionSummary>
            <AccordionDetails
              id={`driver-${p.driver2.id}-accordion-details`}
              key={`driver-${p.driver2.id}-accordion-details`}
            >
              <Typography key={`${p.driver2.id}-driver-links`}>
                <Link
                  key={`${p.driver2.id}-driver1-link`}
                  href={p.driver1.url ?? ""}
                >
                  {p.driver1.name}
                </Link>
                {` was teammates with `}
                <Link
                  key={`${p.driver2.id}-driver2-link`}
                  href={p.driver2.url ?? ""}
                >
                  {p.driver2.name}
                </Link>
              </Typography>

              <table key={`${p.driver2.id}-links-table`}>
                <tbody key={`${p.driver2.id}-links-table-body`}>
                  {p.dates?.map((date, j) => {
                    const slug = `date-${i}-${j}`;
                    return (
                      <Fragment key={`${slug}-fragment`}>
                        {date.count == 1 ? (
                          <DegreesSingleRace
                            key={`${slug}-degrees`}
                            data={date}
                          />
                        ) : (
                          <DegreesMultipleRaces
                            key={`${slug}-degrees`}
                            data={date}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>
    </span>
  );
};

interface degreesRaceProps {
  data: Data;
}

const DegreesSingleRace = ({ data }: degreesRaceProps) => {
  return (
    <>
      <tr>
        <td>{`for:`}</td>
        <td>
          {data.startUrl ? (
            <Typography>
              <Link href={data.startUrl}>
                <strong>{`${getYear(data?.startDate ?? "")} ${
                  data.startRace
                }`}</strong>
              </Link>
            </Typography>
          ) : (
            <strong>{`${getYear(data?.startDate ?? "")} ${
              data.startRace
            }`}</strong>
          )}
        </td>
      </tr>
    </>
  );
};

const DegreesMultipleRaces = ({ data }: degreesRaceProps) => {
  return (
    <>
      <tr>
        <td>{"for:"}</td>
        <td>{`${data.count} races`}</td>
      </tr>
      <tr>
        <td>{`from:`}</td>
        <td>
          <Typography>
            {data.startUrl ? (
              <Link href={data.startUrl}>
                <strong>{`${getYear(data?.startDate ?? "")} ${
                  data.startRace
                }`}</strong>
              </Link>
            ) : (
              <strong>{`${getYear(data?.startDate ?? "")} ${
                data.startRace
              }`}</strong>
            )}
          </Typography>
        </td>
      </tr>
      <tr>
        <td>{`to:`}</td>
        <td>
          <Typography>
            {data.endUrl ? (
              <Link href={data.endUrl}>
                <strong>{`${getYear(data?.endDate ?? "")} ${
                  data.endRace
                }`}</strong>
              </Link>
            ) : (
              <strong>{`${getYear(data?.endDate ?? "")} ${
                data.endRace
              }`}</strong>
            )}
          </Typography>
        </td>
      </tr>
    </>
  );
};

const getYear = (endDate: Maybe<string> | undefined) =>
  (endDate ?? "").split("-")[0];

export default memo(DegreesOfSeparation);
