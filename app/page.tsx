import OccupiedDatesDropdown from "@/app/components/occupied-dates-dropdown";
import {
  formatMalaysiaDateTime,
  countNightsInMonth,
  countNightsInYear,
} from "@/lib/date-utils";
import type { BookingData } from "@/lib/types";

async function getDashboardData(): Promise<BookingData> {
  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}

export default async function HomePage() {
  const data = await getDashboardData();

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
          <h1 className="text-3xl font-bold " style={{ color: '#FF385C' }}>Airbnb Tracker</h1>
        </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">Last synced</p>
      <p className="mt-1 text-lg font-semibold text-gray-600">
        {formatMalaysiaDateTime(data.last_synced_at)}
      </p>
      </div>

      <div className="statsRow">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Upcoming reserved nights</p>
        <p className="mt-1 text-2xl font-bold text-gray-600">
          {data.occupied_dates.length}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Current Month</p>
        <p className="mt-1 text-2xl font-bold text-gray-600">{currentMonthTotal}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Current Year</p>
        <p className="mt-1 text-2xl font-bold text-gray-600">{currentYearTotal}</p>
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
