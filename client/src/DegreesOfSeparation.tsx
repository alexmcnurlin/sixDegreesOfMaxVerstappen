import { memo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from "@mui/joy";
import { Maybe, GetDegreesOfSeparationQuery } from "./gql/graphql";

type Pairing = GetDegreesOfSeparationQuery["degreesOfSeparation"][0];
type Data = Pairing["dates"][0];

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
              {`${p.driver1.name} was teammates with ${p.driver2.name}`}

              <table>
                <tbody>
                  {p.dates?.map((date, j) => {
                    const slug = `date-${i}-${j}`;
                    return (
                      <>
                        {date.count == 1 ? (
                          <DegreesSingleRace data={date} slug={slug} />
                        ) : (
                          <DegreesMultipleRaces data={date} slug={slug} />
                        )}
                      </>
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
  slug: string;
  data: Data;
}

const DegreesSingleRace = ({ slug, data }: degreesRaceProps) => {
  return (
    <>
      <tr key={`${slug}-from-row`}>
        <td key={`${slug}-from`}>{`for: `}</td>
        <td key={`${slug}-from-race`}>
          {data.startUrl ? (
            <a href={data.startUrl}>
              <strong key={`${slug}-start-race`}>{`${getYear(
                data?.startDate ?? ""
              )} ${data.startRace}`}</strong>
            </a>
          ) : (
            <strong key={`${slug}-start-race`}>{`${getYear(
              data?.startDate ?? ""
            )} ${data.startRace}`}</strong>
          )}
        </td>
      </tr>
    </>
  );
};

const DegreesMultipleRaces = ({ slug, data }: degreesRaceProps) => {
  return (
    <>
      <tr key={`${slug}-count-row`}>
        <td key={`${slug}-empty`}>{"for:"}</td>
        <td key={`${slug}-count`}>{`${data.count} races`}</td>
      </tr>
      <tr key={`${slug}-from-row`}>
        <td key={`${slug}-from`}>{`from: `}</td>
        <td key={`${slug}-from-race`}>
          {data.startUrl ? (
            <a href={data.startUrl}>
              <strong key={`${slug}-start-race`}>{`${getYear(
                data?.startDate ?? ""
              )} ${data.startRace}`}</strong>
            </a>
          ) : (
            <strong key={`${slug}-start-race`}>{`${getYear(
              data?.startDate ?? ""
            )} ${data.startRace}`}</strong>
          )}
        </td>
      </tr>
      <tr key={`${slug}-to-row`}>
        <td key={`${slug}-to`}>{`to:`}</td>
        <td key={`${slug}-end-row`}>
          {data.endUrl ? (
            <a href={data.endUrl}>
              <strong key={`${slug}-end-race`}>{`${getYear(
                data?.endDate ?? ""
              )} ${data.endRace}`}</strong>
            </a>
          ) : (
            <strong key={`${slug}-end-race`}>{`${getYear(
              data?.endDate ?? ""
            )} ${data.endRace}`}</strong>
          )}
        </td>
      </tr>
    </>
  );
};

const getYear = (endDate: Maybe<string> | undefined) =>
  (endDate ?? "").split("-")[0];

export default memo(DegreesOfSeparation);
