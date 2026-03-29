import { get, put } from "@vercel/blob";
import type { BookingData } from "@/lib/types";

const BLOB_PATH = "bookings/current.json";

const fallbackData: BookingData = {
  last_synced_at: "",
  occupied_dates: [

  ],
};

export async function getBookingData(): Promise<BookingData> {
  try {
    const result = await get(BLOB_PATH, { access: "private" });

    if (!result || !result.stream) {
      return fallbackData;
    }

    const text = await new Response(result.stream).text();
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
    allowOverwrite: true,
    contentType: "application/json",
  });
}