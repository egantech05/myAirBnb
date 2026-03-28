import OccupiedDatesDropdown from "@/app/components/occupied-dates-dropdown";
import {
  formatMalaysiaDateTime,
  countNightsInMonth,
  countNightsInYear,
} from "@/lib/date-utils";
import type { BookingData } from "@/lib/types";

export default async function HomePage() {
  const data: BookingData = {
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

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const currentMonthTotal = countNightsInMonth(
    data.occupied_dates,
    currentYear,
    currentMonth
  );

  const currentYearTotal = countNightsInYear(
    data.occupied_dates,
    currentYear
  );

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#FF385C" }}>
            Airbnb Tracker
          </h1>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Last synced</p>
          <p className="mt-1 text-lg font-semibold text-gray-600">
            {formatMalaysiaDateTime(data.last_synced_at)}
          </p>
        </div>

        <div className="statsRow">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">
              {data.occupied_dates.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Current Month</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">
              {currentMonthTotal}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Current Year</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">
              {currentYearTotal}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mt-4">
            <OccupiedDatesDropdown occupiedDates={data.occupied_dates} />
          </div>
        </div>
      </div>
    </main>
  );
}