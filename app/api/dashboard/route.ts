import { NextResponse } from "next/server";
import type { BookingData } from "@/lib/types";

export async function GET() {
  const data: BookingData = {
    last_synced_at: "2026-03-28T15:02:00Z",
    occupied_dates: [
      "2026-04-02",
      "2026-04-03",
      "2026-04-10",
      "2026-04-11",
      "2026-05-01",
      "2026-05-02",
      "2026-05-15",
      "2026-06-01",
      "2025-01-05",
      "2025-01-06",
      "2025-12-15",
      "2025-12-01",
      "2025-11-05",
      "2025-10-06",
      
    ],
  };

  return NextResponse.json(data);
}