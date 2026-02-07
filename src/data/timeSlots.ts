import { AVAILABILITY } from "./availability";

export function isOpenDay(date: Date) {
  return AVAILABILITY.openDays.includes(date.getDay());
}

export function clampToMidnight(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function formatDateInput(d: Date) {
  // YYYY-MM-DD for <input type="date">
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTimeLabel(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function buildSlotsForDate(date: Date) {
  const d = clampToMidnight(date);

  if (!isOpenDay(d)) return [];

  const start = new Date(d);
  start.setHours(AVAILABILITY.startHour, 0, 0, 0);

  const end = new Date(d);
  end.setHours(AVAILABILITY.endHour, 0, 0, 0);

  const slots: Date[] = [];

  let cursor = new Date(start);
  const step = AVAILABILITY.slotMinutes + AVAILABILITY.bufferMinutes;

  while (cursor.getTime() + AVAILABILITY.slotMinutes * 60_000 <= end.getTime()) {
    slots.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + step * 60_000);
  }

  return slots;
}
