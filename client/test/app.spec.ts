import { test, expect } from "@playwright/test";
import { interceptGql } from "./interceptGql";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page).toHaveTitle(/6 Degrees of Max Verstappen/);
});

test("has description of the site", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator("#description")).toContainText(
    "Six Degrees of Kevin Bacon"
  );
});

test("the user can see a list of drivers", async ({ page }) => {
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "first" },
      { id: "2", name: "second" },
      { id: "3", name: "third" },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Verify the first input shows available options
  await page.locator("#driver1").click();
  await expect(page.locator("#driver1-option-0")).toHaveText("first");
  await expect(page.locator("#driver1-option-1")).toHaveText("second");
  await expect(page.locator("#driver1-option-2")).toHaveText("third");
  // Click on an option to close the menu
  await page.locator("#driver1-option-2").click();

  // Verify the second input shows available options
  await page.locator("#driver2").click();
  await expect(page.locator("#driver2-option-0")).toHaveText("first");
  await expect(page.locator("#driver2-option-1")).toHaveText("second");
  await expect(page.locator("#driver2-option-2")).toHaveText("third");
});

test("the user can select drivers", async ({ page }) => {
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "first" },
      { id: "2", name: "second" },
      { id: "3", name: "third" },
    ],
  });
  await page.goto("http://localhost:5173/");

  await expect(page.locator("#driver1")).toHaveAttribute(
    "placeholder",
    "Select a driver..."
  );
  await expect(page.locator("#driver2")).toHaveAttribute(
    "placeholder",
    "Select a driver..."
  );
  // Fill in the text boxes
  await page.locator("#driver1").fill("first");
  await page.locator("#driver2").fill("third");

  // Verify their values are populated
  expect(await page.locator("#driver1").inputValue()).toEqual("first");
  expect(await page.locator("#driver2").inputValue()).toEqual("third");
});

test("the user can see the links between drivers", async ({ page }) => {
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "first" },
      { id: "2", name: "second" },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "first" },
        driver2: { id: "2", name: "second" },
        dates: [{ start: "1950", end: "2025" }],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Fill out the input boxes
  await page.locator("#driver1").fill("first");
  await page.locator("#driver1-option-0").click(); // Select the first option
  await page.locator("#driver2").fill("second");
  await page.locator("#driver2-option-0").click(); // Select the first option

  // Verify the degrees of separation are shown.
  await expect(page.locator("#degreesOfSeparation")).toHaveText(
    "first was teammates with second from 1950-2025"
  );
});

test("the user can see multiple links between drivers", async ({ page }) => {
  await interceptGql(page, "GetDrivers", {
    drivers: [
      { id: "1", name: "first" },
      { id: "2", name: "second" },
      { id: "3", name: "third" },
    ],
  });
  await interceptGql(page, "GetDegreesOfSeparation", {
    degreesOfSeparation: [
      {
        driver1: { id: "1", name: "first" },
        driver2: { id: "2", name: "second" },
        dates: [{ start: "1950", end: "1951" }],
      },
      {
        driver1: { id: "2", name: "second" },
        driver2: { id: "3", name: "third" },
        dates: [{ start: "1952", end: "2025" }],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Select drivers with 2 degrees of separation
  await page.locator("#driver1").fill("first");
  await page.locator("#driver1-option-0").click(); // Select the first option
  await page.locator("#driver2").fill("third");
  await page.locator("#driver2-option-0").click(); // Select the first option

  // Verify
  await expect(page.locator("#degreesOfSeparation")).toHaveText(
    "first was teammates with second from 1950-1951\n\nsecond was teammates with third from 1952-2025"
  );
});

test("Max Verstappen is selected by default for the first driver", async ({
  page,
}) => {
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
        dates: [{ start: "2015", end: "2015" }],
      },
    ],
  });
  await page.goto("http://localhost:5173/");

  // Only select the second driver - The first is selected by default.
  await page.locator("#driver2").fill("Carlos Sainz Jr.");
  await page.locator("#driver2-option-0").click();

  await expect(page.locator("#degreesOfSeparation")).toHaveText(
    "Max Verstappen was teammates with Carlos Sainz Jr. for 2015"
  );
});
