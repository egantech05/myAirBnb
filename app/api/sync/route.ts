import { NextResponse } from "next/server";
import { saveBookingData } from "@/lib/blob-storage";
import type { BookingData } from "@/lib/types";

export async function GET() {
  const testData: BookingData = {
    last_synced_at: new Date().toISOString(),
    occupied_dates: [
      "2025-10-06",
      "2025-11-05",
      "2025-12-01",
      "2025-12-15",
      "2026-04-02",
      "2026-04-03",
      "2026-04-10",
      "2026-04-11",
      "2026-05-01",
      "2026-05-02",
      "2026-05-15",
      "2026-06-01",
    ],
  };

  await saveBookingData(testData);

  return NextResponse.json({
    ok: true,
    message: "Blob data saved",
  });
}