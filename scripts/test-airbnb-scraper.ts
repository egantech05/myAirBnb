import { loadEnvConfig } from "@next/env";
import { scrapeOccupiedDates } from "@/lib/scraper";

loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const listingUrl = process.env.AIRBNB_LISTING_URL;

  if (!listingUrl) {
    throw new Error("Missing AIRBNB_LISTING_URL in .env.local");
  }

  const dates = await scrapeOccupiedDates(listingUrl);

  console.log("Blocked future dates found:");
  console.log(dates);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});