/** Inclusive YYYY-MM-DD range. */
export type DateRange = { startDate: string; endDate: string };

/** Today as YYYY-MM-DD (UTC, matching the API's dates). */
export const todayIso = () => new Date().toISOString().slice(0, 10);

export type DateRangeError =
  | "dashboard.dateRange.errors.required"
  | "dashboard.dateRange.errors.order"
  | "dashboard.dateRange.errors.future";

/** Translation key of the first problem with a from/to pair, or null. */
export function validateDateRange(
  from: string,
  to: string,
): DateRangeError | null {
  if (!from || !to) return "dashboard.dateRange.errors.required";
  if (from > to) return "dashboard.dateRange.errors.order";
  if (to > todayIso()) return "dashboard.dateRange.errors.future";
  return null;
}
