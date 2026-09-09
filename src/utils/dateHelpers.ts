/**
 * Date utility helpers — Restore Prototype
 *
 * Uses local calendar date (not UTC) to avoid date shifting on date boundaries.
 * This is the single source of truth for "today" across the application.
 */

/**
 * Returns a date as a 'YYYY-MM-DD' string in the user's local time zone.
 * Pass a Date object to convert it; defaults to now.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEMO_DATE = '2026-09-08';
export const DEMO_DATETIME = '2026-09-08T22:15:00+08:00';
export const DEMO_TIMEZONE = 'Asia/Kuala_Lumpur';

/**
 * Returns today's local calendar date as 'YYYY-MM-DD'.
 * Fixed source of truth for the Nicole demo: 2026-09-08.
 */
export function getTodayLocalDate(): string {
  return DEMO_DATE;
}

/**
 * Returns the local date string for N days ago from demo today.
 */
export function getLocalDateStringDaysAgo(n: number): string {
  const [year, month, day] = DEMO_DATE.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - n);
  return getLocalDateString(d);
}

/**
 * Returns an ordered array of the last N local calendar dates (oldest first),
 * including demo today (2026-09-08) as the last element.
 */
export function getLastNLocalDates(n: number): Array<{ dateStr: string; date: Date; isToday: boolean }> {
  const [year, month, day] = DEMO_DATE.split('-').map(Number);
  const anchorDate = new Date(year, month - 1, day);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - (n - 1 - i));
    return {
      dateStr: getLocalDateString(d),
      date: d,
      isToday: i === n - 1
    };
  });
}

/**
 * Returns the short weekday label for a date (Mon, Tue, Wed, Thu, Fri, Sat, Sun).
 */
export function getShortWeekdayLabel(date: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}
