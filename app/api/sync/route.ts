import { NextRequest, NextResponse } from "next/server";
import { scrapeOccupiedDates } from "@/lib/scraper";
import { saveBookingData } from "@/lib/blob-storage";
import type { BookingData } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const listingUrl = process.env.AIRBNB_LISTING_URL;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing CRON_SECRET" },
      { status: 500 }
    );
  }

  if (!listingUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing AIRBNB_LISTING_URL" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const occupiedDates = await scrapeOccupiedDates(listingUrl);

    const data: BookingData = {
      last_synced_at: new Date().toISOString(),
      occupied_dates: occupiedDates,
    };

    await saveBookingData(data);

    return NextResponse.json({
      ok: true,
      total_dates: occupiedDates.length,
      data,
    });
    } catch (error) {
        console.error("Sync failed:", error);
    
        const message =
        error instanceof Error ? error.message : "Unknown error";
    
        return NextResponse.json(
        { ok: false, error: "Sync failed", message },
        { status: 500 }
        );
    }
}