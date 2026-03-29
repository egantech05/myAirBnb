import Kernel from "@onkernel/sdk";

const MONTHS_TO_CHECK = 3;

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function scrapeOccupiedDates(
  listingUrl: string
): Promise<string[]> {
  const apiKey = process.env.KERNEL_API_KEY;

  if (!apiKey) {
    throw new Error("Missing KERNEL_API_KEY");
  }

  const kernel = new Kernel({ apiKey });
  const kernelBrowser = await kernel.browsers.create();

  try {
    const response = await kernel.browsers.playwright.execute(
      kernelBrowser.session_id,
      {
        timeout_sec: 120,
        code: `
          const MONTHS_TO_CHECK = ${MONTHS_TO_CHECK};

          function normalizeDateFromTestId(testId) {
            const match = testId.match(/calendar-day-(\\d{2})\\/(\\d{2})\\/(\\d{4})/);

            if (!match) {
              return null;
            }

            const day = match[1];
            const month = match[2];
            const year = match[3];

            return \`\${year}-\${month}-\${day}\`;
          }

          function getTodayString() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");

            return \`\${year}-\${month}-\${day}\`;
          }

          function isFutureDate(dateString) {
            return dateString > getTodayString();
          }

          async function collectVisibleBlockedDates() {
            const dayData = await page.$$eval(
              '[data-testid^="calendar-day-"]',
              (elements) =>
                elements.map((el) => ({
                  testId: el.getAttribute("data-testid"),
                  blocked: el.getAttribute("data-is-day-blocked"),
                }))
            );

            return dayData
              .filter((item) => item.testId && item.blocked === "true")
              .map((item) => normalizeDateFromTestId(item.testId))
              .filter((date) => Boolean(date))
              .filter((date) => isFutureDate(date));
          }

          async function clickNextMonth() {
            const nextButton = page
              .locator('button[aria-label*="Next"], button[aria-label*="next"]')
              .first();

            const count = await nextButton.count();

            if (count === 0) {
              throw new Error("Could not find the next-month button.");
            }

            await nextButton.click();
            await page.waitForTimeout(1500);
          }

          async function openCalendarIfNeeded() {
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

          await page.goto(${JSON.stringify(listingUrl)}, {
            waitUntil: "domcontentloaded",
          });

          await page.waitForTimeout(4000);
          await openCalendarIfNeeded();

          const blockedDates = new Set();

          for (let i = 0; i < MONTHS_TO_CHECK; i++) {
            const visibleBlockedDates = await collectVisibleBlockedDates();

            for (const date of visibleBlockedDates) {
              blockedDates.add(date);
            }

            if (i < MONTHS_TO_CHECK - 1) {
              await clickNextMonth();
            }
          }

          return Array.from(blockedDates)
            .filter((date) => isFutureDate(date))
            .sort((a, b) => a.localeCompare(b));
        `,
      }
    );

    if (!response.success) {
      throw new Error(response.error || "Kernel Playwright execution failed");
    }

    return Array.isArray(response.result) ? response.result : [];
  } finally {
    await kernel.browsers.deleteByID(kernelBrowser.session_id);
  }
}