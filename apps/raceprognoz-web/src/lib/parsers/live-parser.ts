import { chromium, Browser, Page } from "playwright";
import { writeFile } from "node:fs/promises";

let browser: Browser | null = null;
let page: Page | null = null;

export async function initLiveParser(url: string) {
  if (browser && page) {
    return;
  }

  browser = await chromium.launch({
    headless: true,
  });

  page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  console.log("Page loaded");
  const html = await page.content();
    await writeFile("debug.html", html);
}


export async function getLiveHtml(): Promise<string> {
  if (!page) {
    throw new Error("Parser is not initialized");
  }

  return await page.content();
}

export async function getDrivers() {
  if (!page) {
    throw new Error("Parser is not initialized");
  }

  return await page.locator("div.grid.h-14").evaluateAll(rows =>
    rows.map(row => {
      const cells = row.querySelectorAll(":scope > div");

      const driverLink = cells[1]?.querySelector(
        "a[href^='/drivers/']"
      );

      const teamLink = cells[1]?.querySelector(
        "a[href^='/teams/']"
      );

      const position = cells[0]
        ?.querySelector(".pos-badge")
        ?.textContent
        ?.trim();

      const fullName = driverLink
        ?.childNodes[0]
        ?.textContent
        ?.trim();

      const code = driverLink
        ?.querySelector("span")
        ?.textContent
        ?.trim();

      const team = teamLink
        ?.textContent
        ?.trim();

      const time = cells[2]
        ?.textContent
        ?.trim();

      const points = cells[3]
        ?.textContent
        ?.trim();

      return {
        position: position === 'NaN' ? time : position,
        driverName: fullName,
        driverCode: code,
        team,
        time,
        points,
      };
    })
  );
}

export async function closeLiveParser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}