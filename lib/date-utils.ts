export type MonthGroup = {
    monthKey: string;
    monthLabel: string;
    dates: string[];
    totalNights: number;
  };
  
  export type YearGroup = {
    year: string;
    totalNights: number;
    months: MonthGroup[];
  };
  
  export function formatMalaysiaDateTime(isoString: string): string {
    const date = new Date(isoString);
  
    return new Intl.DateTimeFormat("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }
  
  export function groupDatesByYearMonth(dates: string[]): YearGroup[] {
    const yearMap: Record<string, Record<string, string[]>> = {};
  
    for (const date of dates) {
      const year = date.slice(0, 4);
      const monthKey = date.slice(0, 7);
  
      if (!yearMap[year]) {
        yearMap[year] = {};
      }
  
      if (!yearMap[year][monthKey]) {
        yearMap[year][monthKey] = [];
      }
  
      yearMap[year][monthKey].push(date);
    }
  
    return Object.entries(yearMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, monthsObj]) => {
        const months = Object.entries(monthsObj)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([monthKey, monthDates]) => {
            const sampleDate = new Date(`${monthKey}-01T00:00:00Z`);
            const monthLabel = new Intl.DateTimeFormat("en-US", {
              month: "long",
              timeZone: "UTC",
            }).format(sampleDate);
  
            const sortedDates = [...monthDates].sort((a, b) =>
              a.localeCompare(b)
            );
  
            return {
              monthKey,
              monthLabel,
              dates: sortedDates,
              totalNights: sortedDates.length,
            };
          });
  
        return {
          year,
          totalNights: months.reduce((sum, month) => sum + month.totalNights, 0),
          months,
        };
      });
  }
  
  export function countNightsByMonth(dates: string[]) {
    const counts: Record<string, number> = {};
  
    for (const date of dates) {
      const monthKey = date.slice(0, 7);
      counts[monthKey] = (counts[monthKey] || 0) + 1;
    }
  
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, nights]) => {
        const sampleDate = new Date(`${month}-01T00:00:00Z`);
        const label = new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(sampleDate);
  
        return {
          label,
          nights,
        };
      });
  }
  
  export function countNightsByYear(dates: string[]) {
    const counts: Record<string, number> = {};
  
    for (const date of dates) {
      const year = date.slice(0, 4);
      counts[year] = (counts[year] || 0) + 1;
    }
  
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, nights]) => ({
        label: year,
        nights,
      }));
  }
  
  export function countNightsInMonth(
    dates: string[],
    year: number,
    month: number
  ) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    return dates.filter((d) => d.startsWith(monthKey)).length;
  }
  
  export function countNightsInYear(dates: string[], year: number) {
    const yearKey = String(year);
    return dates.filter((d) => d.startsWith(yearKey)).length;
  }
  