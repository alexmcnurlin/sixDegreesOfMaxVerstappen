import { test, expect } from "@playwright/test";
import { interceptGql } from "./interceptGql";

test("can see race details", async ({ page }) => {
  // Arrange
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "Max Verstappen" },
      { id: "2", name: "Carlos Sainz Jr." },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "Max Verstappen" },
        driver2: { id: "2", name: "Carlos Sainz Jr." },
        dates: [
          {
            startRace: "start",
            endRace: "end",
            count: 55,
            startDate: "2015",
            endDate: "2016",
          },
        ],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Act
  // Only select the second driver - The first is selected by default.
  await page.locator("#driver2").fill("Carlos Sainz Jr.");
  await page.locator("#driver2-option-0").click();

  // await expect(page.locator("#degreesOfSeparation")).toContainText(
  //   "1 degree of separation:0) Max Verstappen1) Carlo Sainz Jr."
  // );

  // Assert
  await expect(page.locator("#driver-1-accordion-summary")).toHaveText(
    "0) Max Verstappen"
  );
  await expect(page.locator("#driver-2-accordion-summary")).toHaveText(
    "1) Carlos Sainz Jr. (55 races)"
  );
  await expect(page.locator("#driver-2-accordion-details")).toHaveText(
    "Max Verstappen was teammates with Carlos Sainz Jr.for:55 racesfrom:2015 startto:2016 end"
  );
});

test("can see multple links", async ({ page }) => {
  // Arrange
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "Max Verstappen" },
      { id: "2", name: "Carlos Sainz Jr." },
      { id: "3", name: "Charles Leclerc" },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "Max Verstappen" },
        driver2: { id: "2", name: "Carlos Sainz Jr." },
        dates: [
          {
            startRace: "start",
            endRace: "end",
            count: 55,
            startDate: "2015",
            endDate: "2016",
          },
        ],
      },
      {
        driver1: { id: "2", name: "Carlos Sainz Jr." },
        driver2: { id: "3", name: "Charles Leclerc" },
        dates: [
          {
            startRace: "start",
            endRace: "end",
            count: 16,
            startDate: "1234",
            endDate: "4321",
          },
        ],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Act
  // Only select the second driver - The first is selected by default.
  await page.locator("#driver2").fill("Charles Leclerc");
  await page.locator("#driver2-option-0").click();

  // await expect(page.locator("#degreesOfSeparation")).toContainText(
  //   "1 degree of separation:0) Max Verstappen1) Carlo Sainz Jr."
  // );

  // Assert
  await expect(page.locator("#driver-1-accordion-summary")).toHaveText(
    "0) Max Verstappen"
  );
  await expect(page.locator("#driver-2-accordion-summary")).toHaveText(
    "1) Carlos Sainz Jr. (55 races)"
  );
  await expect(page.locator("#driver-3-accordion-summary")).toHaveText(
    "2) Charles Leclerc (16 races)"
  );
  await expect(page.locator("#driver-2-accordion-details")).toHaveText(
    "Max Verstappen was teammates with Carlos Sainz Jr.for:55 racesfrom:2015 startto:2016 end"
  );
  await expect(page.locator("#driver-3-accordion-details")).toHaveText(
    "Carlos Sainz Jr. was teammates with Charles Leclercfor:16 racesfrom:1234 startto:4321 end"
  );
});

test("can see multiple race ranges", async ({ page }) => {
  // Arrange
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "Max Verstappen" },
      { id: "2", name: "Carlos Sainz Jr." },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "Max Verstappen" },
        driver2: { id: "2", name: "Carlos Sainz Jr." },
        dates: [
          {
            startRace: "start1",
            endRace: "end1",
            count: 55,
            startDate: "1234",
            endDate: "4321",
          },
          {
            startRace: "start2",
            startDate: "1235",
            count: 1,
          },
        ],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Act
  // Only select the second driver - The first is selected by default.
  await page.locator("#driver2").fill("Carlos Sainz Jr.");
  await page.locator("#driver2-option-0").click();

  // Assert
  await expect(page.locator("#driver-1-accordion-summary")).toHaveText(
    "0) Max Verstappen"
  );
  await expect(page.locator("#driver-2-accordion-summary")).toHaveText(
    "1) Carlos Sainz Jr. (56 races)"
  );
  await expect(page.locator("#driver-2-accordion-details")).toHaveText(
    "Max Verstappen was teammates with Carlos Sainz Jr.for:55 racesfrom:1234 start1to:4321 end1for:1235 start2"
  );
});

test("can see urls for drivers", async ({ page }) => {
  // Arrange
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "Max Verstappen" },
      { id: "2", name: "Carlos Sainz Jr." },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "Max Verstappen", url: "link1" },
        driver2: { id: "2", name: "Carlos Sainz Jr.", url: "link2" },
        dates: [
          {
            startRace: "start1",
            endRace: "end1",
            startDate: "1234",
            endDate: "4321",
          },
        ],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Act
  // Only select the second driver - The first is selected by default.
  await page.locator("#driver2").fill("Carlos Sainz Jr.");
  await page.locator("#driver2-option-0").click();

  // Assert
  await expect(page.locator("#driver-2-accordion-details a").nth(0)).toHaveText(
    "Max Verstappen"
  );
  await expect(
    page.locator("#driver-2-accordion-details a").nth(0)
  ).toHaveAttribute("href", "link1");

  await expect(page.locator("#driver-2-accordion-details a").nth(1)).toHaveText(
    "Carlos Sainz Jr."
  );
  await expect(
    page.locator("#driver-2-accordion-details a").nth(1)
  ).toHaveAttribute("href", "link2");
});

test("can see urls for races", async ({ page }) => {
  // Arrange
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "Max Verstappen" },
      { id: "2", name: "Carlos Sainz Jr." },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "Max Verstappen" },
        driver2: { id: "2", name: "Carlos Sainz Jr." },
        dates: [
          {
            startRace: "start1",
            endRace: "end1",
            startDate: "1234",
            endDate: "4321",
            startUrl: "link1",
            endUrl: "link2",
          },
          {
            startRace: "start2",
            startDate: "1235",
            startUrl: "link3",
            count: 1,
          },
        ],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Act
  // Only select the second driver - The first is selected by default.
  await page.locator("#driver2").fill("Carlos Sainz Jr.");
  await page.locator("#driver2-option-0").click();

  // Assert
  await expect(page.locator("#driver-2-accordion-details a").nth(2)).toHaveText(
    "1234 start1"
  );
  await expect(
    page.locator("#driver-2-accordion-details a").nth(2)
  ).toHaveAttribute("href", "link1");

  await expect(page.locator("#driver-2-accordion-details a").nth(3)).toHaveText(
    "4321 end1"
  );
  await expect(
    page.locator("#driver-2-accordion-details a").nth(3)
  ).toHaveAttribute("href", "link2");

  await expect(page.locator("#driver-2-accordion-details a").nth(4)).toHaveText(
    "1235 start2"
  );
  await expect(
    page.locator("#driver-2-accordion-details a").nth(4)
  ).toHaveAttribute("href", "link3");
});
