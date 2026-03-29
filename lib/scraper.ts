import { chromium, type Page } from "playwright";

const MONTHS_TO_CHECK = 3;

type DayCellData = {
  testId: string | null;
  blocked: string | null;
  available: string | null;
  ariaLabel: string | null;
};

function normalizeDateFromTestId(testId: string): string | null {
  const match = testId.match(/calendar-day-(\d{2})\/(\d{2})\/(\d{4})/);

  if (!match) {
    return null;
  }

  const day = match[1];
  const month = match[2];
  const year = match[3];

  return `${year}-${month}-${day}`;
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isFutureDate(dateString: string): boolean {
  return dateString > getTodayString();
}

async function collectVisibleBlockedDates(page: Page): Promise<string[]> {
  const dayData = await page.$$eval(
    '[data-testid^="calendar-day-"]',
    (elements): DayCellData[] =>
      elements.map((el) => ({
        testId: el.getAttribute("data-testid"),
        blocked: el.getAttribute("data-is-day-blocked"),
        available: el.getAttribute("data-is-day-available"),
        ariaLabel: el.getAttribute("aria-label"),
      }))
  );

  return dayData
    .filter((item: DayCellData) => item.testId !== null && item.blocked === "true")
    .map((item: DayCellData) => normalizeDateFromTestId(item.testId!))
    .filter((date: string | null): date is string => Boolean(date))
    .filter((date: string) => isFutureDate(date));
}

async function clickNextMonth(page: Page): Promise<void> {
  const nextButton = page
    .locator('button[aria-label*="Next"], button[aria-label*="next"]')
    .first();

  if ((await nextButton.count()) === 0) {
    throw new Error("Could not find the next-month button.");
  }

  await nextButton.click();
  await page.waitForTimeout(1500);
}

async function openCalendarIfNeeded(page: Page): Promise<void> {
  const existingDays = page.locator('[data-testid^="calendar-day-"]');

  if ((await existingDays.count()) > 0) {
    return;
  }

  const candidates = [
    'button[aria-label*="Check in"]',
    'button[aria-label*="check in"]',
    '[data-testid="structured-search-input-field-split-dates-0"]',
    '[data-testid="change-dates-checkIn"]',
  ];

  for (const selector of candidates) {
    const locator = page.locator(selector).first();

    if ((await locator.count()) > 0) {
      await locator.click();
      await page.waitForTimeout(2000);

      if ((await existingDays.count()) > 0) {
        return;
      }
    }
  }

  throw new Error("Could not open the availability calendar.");
}

export async function scrapeOccupiedDates(
  listingUrl: string
): Promise<string[]> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto(listingUrl, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(4000);

    await openCalendarIfNeeded(page);

    const blockedDates = new Set<string>();

    for (let i = 0; i < MONTHS_TO_CHECK; i++) {
      const visibleBlockedDates = await collectVisibleBlockedDates(page);

      for (const date of visibleBlockedDates) {
        blockedDates.add(date);
      }

      if (i < MONTHS_TO_CHECK - 1) {
        await clickNextMonth(page);
      }
    }

    return Array.from(blockedDates)
      .filter((date) => isFutureDate(date))
      .sort((a, b) => a.localeCompare(b));
  } finally {
    await browser.close();
  }
}