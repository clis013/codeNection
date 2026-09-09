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

/**
 * Returns today's local calendar date as 'YYYY-MM-DD'.
 * This is the canonical "today" used throughout the app.
 */
export function getTodayLocalDate(): string {
  return getLocalDateString(new Date());
}

/**
 * Returns the local date string for N days ago from today.
 */
export function getLocalDateStringDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return getLocalDateString(d);
}

/**
 * Returns an ordered array of the last N local calendar dates (oldest first),
 * including today as the last element.
 */
export function getLastNLocalDates(n: number): Array<{ dateStr: string; date: Date; isToday: boolean }> {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
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
