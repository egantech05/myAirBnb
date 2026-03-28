import { NextResponse } from "next/server";
import { getBookingData } from "@/lib/blob-storage";

export async function GET() {
  const data = await getBookingData();
  return NextResponse.json(data);
}