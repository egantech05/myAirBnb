import { put, head, download } from "@vercel/blob";
import type { BookingData } from "@/lib/types";

const BLOB_PATH = "bookings/current.json";

const fallbackData: BookingData = {
  last_synced_at: "2026-03-28T15:02:00Z",
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

export async function getBookingData(): Promise<BookingData> {
  try {
    const blob = await head(BLOB_PATH);
    const response = await download(blob.url);
    const text = await response.text();

    return JSON.parse(text) as BookingData;
  } catch {
    return fallbackData;
  }
}

export async function saveBookingData(data: BookingData) {
  const body = JSON.stringify(data, null, 2);

  await put(BLOB_PATH, body, {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}