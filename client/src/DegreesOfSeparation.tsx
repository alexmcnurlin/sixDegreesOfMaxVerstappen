import { memo } from "react";
import type { Pairing } from "./Types";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  List,
  ListItem,
} from "@mui/joy";

interface DegreesOfSeparationProps {
  pairings: Pairing[];
}

const DegreesOfSeparation = ({ pairings }: DegreesOfSeparationProps) => {
  console.log(JSON.stringify(pairings));

  return (
    <>
      {`${pairings.length} degrees of separation:`}
      <AccordionGroup transition="1.2s ease">
        <Accordion key={`${pairings[0].driver1.id}-accordion`} disabled>
          <AccordionSummary
            key={`${pairings[0].driver1.id}-accordion-summary`}
            indicator={<></>}
          >
            {`0) ${pairings[0].driver1.name}`}
          </AccordionSummary>
        </Accordion>
        {pairings.map((p, i) => (
          <Accordion key={`${p.driver2.id}-accordion`}>
            <AccordionSummary key={`${p.driver2.id}-accordion-summary`}>
              {`${i + 1}) ${p.driver2.name}`}
            </AccordionSummary>
            <AccordionDetails key={`${p.driver2.id}-accordion-details`}>
              {`${p.driver1.name} was teammates with ${p.driver2.name}`}
              <List>
                {p.dates.map((d) => (
                  <ListItem key={`${d.startRace}-${d.endRace}`}>{`${getYear(
                    d.startDate
                  )} ${d.startRace} (${d.startDate}) -> ${getYear(d.endDate)} ${
                    d.endRace
                  } (${d.endDate})`}</ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>
    </>
  );
};

const getYear = (endDate: string) => endDate.split("-")[0];

export default memo(DegreesOfSeparation);
