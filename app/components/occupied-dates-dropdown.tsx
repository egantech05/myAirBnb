"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CalendarDays } from "lucide-react";
import { groupDatesByYearMonth } from "@/lib/date-utils";
import styles from "./occupied-dates-dropdown.module.css";

type Props = {
  occupiedDates: string[];
};

function formatDisplayDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function OccupiedDatesDropdown({ occupiedDates }: Props) {
  const grouped = groupDatesByYearMonth(occupiedDates);

  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  function toggleYear(year: string) {
    setOpenYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  }

  function toggleMonth(monthKey: string) {
    setOpenMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  }

  if (grouped.length === 0) {
    return <div className={styles.emptyState}>No occupied dates found.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {grouped.map((yearGroup) => {
        const isYearOpen = !!openYears[yearGroup.year];

        return (
          <div key={yearGroup.year} className={styles.yearCard}>
            <button
              type="button"
              onClick={() => toggleYear(yearGroup.year)}
              className={styles.yearButton}
            >
              <div>
                <p className={styles.yearTitle}>{yearGroup.year}</p>
                <p className={styles.metaText}>
                  {yearGroup.totalNights} night
                  {yearGroup.totalNights === 1 ? "" : "s"}
                </p>
              </div>

              <div className={styles.buttonRight}>
                <span className={styles.buttonLabel}>View months</span>
                {isYearOpen ? (
                  <ChevronDown className={styles.icon} />
                ) : (
                  <ChevronRight className={styles.icon} />
                )}
              </div>
            </button>

            {isYearOpen && (
              <div className={styles.yearContent}>
                <div className={styles.monthList}>
                  {yearGroup.months.map((monthGroup) => {
                    const isMonthOpen = !!openMonths[monthGroup.monthKey];

                    return (
                      <div key={monthGroup.monthKey} className={styles.monthCard}>
                        <button
                          type="button"
                          onClick={() => toggleMonth(monthGroup.monthKey)}
                          className={styles.monthButton}
                        >
                          <div>
                            <p className={styles.monthTitle}>
                              {monthGroup.monthLabel}
                            </p>
                            <p className={styles.metaText}>
                              {monthGroup.totalNights} night
                              {monthGroup.totalNights === 1 ? "" : "s"}
                            </p>
                          </div>

                          <div className={styles.buttonRight}>
                            <span className={styles.buttonLabel}>View dates</span>
                            {isMonthOpen ? (
                              <ChevronDown className={styles.iconSmall} />
                            ) : (
                              <ChevronRight className={styles.iconSmall} />
                            )}
                          </div>
                        </button>

                        {isMonthOpen && (
                          <div className={styles.monthContent}>
                            <ul className={styles.dateList}>
                              {monthGroup.dates.map((date) => (
                                <li key={date} className={styles.dateItem}>
                                  <CalendarDays className={styles.dateIcon} />
                                  <span>{formatDisplayDate(date)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}