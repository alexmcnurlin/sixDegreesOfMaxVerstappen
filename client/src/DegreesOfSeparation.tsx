import { memo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from "@mui/joy";
import { Maybe, GetDegreesOfSeparationQuery } from "./gql/graphql";

type Pairing = GetDegreesOfSeparationQuery["degreesOfSeparation"][0];

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
              {`${i + 1}) ${p.driver2.name}`}
            </AccordionSummary>
            <AccordionDetails
              id={`driver-${p.driver2.id}-accordion-details`}
              key={`driver-${p.driver2.id}-accordion-details`}
            >
              {`${p.driver1.name} was teammates with ${p.driver2.name}`}
              {p.dates?.map((date, j) => {
                const slug = `date-${i}-${j}`;
                return (
                  <table key={`${slug}-table`}>
                    <tbody key={`${slug}-body`}>
                      <tr key={`${slug}-from-row`}>
                        <td key={`${slug}-from`}>{`from: `}</td>
                        <td key={`${slug}-from-race`}>
                          <strong
                            key={`${slug}-start-race`}
                            style={{ display: "inline" }}
                          >{`${getYear(date?.startDate ?? "")} ${
                            date.startRace
                          }`}</strong>
                        </td>
                      </tr>
                      <tr key={`${slug}-to-row`}>
                        <td key={`${slug}-to`}>{`to:`}</td>
                        <td key={`${slug}-end-row`}>
                          <strong key={`${slug}-end-race`}>{`${getYear(
                            date?.endDate
                          )} ${date.endRace}`}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>
    </span>
  );
};

const getYear = (endDate: Maybe<string> | undefined) =>
  (endDate ?? "").split("-")[0];

export default memo(DegreesOfSeparation);
