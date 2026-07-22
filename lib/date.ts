import { DAYS } from "./data";

export const TRIP_START = "2026-09-29";
export const TRIP_END = "2026-10-09";

export function beijingDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function defaultTripDate(now = new Date()): string {
  const today = beijingDate(now);
  if (today < TRIP_START) return TRIP_START;
  if (today > TRIP_END) return TRIP_END;
  return DAYS.some((day) => day.id === today) ? today : TRIP_START;
}

export function daysUntilTrip(now = new Date()): number {
  const today = beijingDate(now);
  if (today >= TRIP_START) return 0;
  const [y, m, d] = today.split("-").map(Number);
  const start = Date.UTC(2026, 8, 29);
  const current = Date.UTC(y, m - 1, d);
  return Math.ceil((start - current) / 86_400_000);
}
