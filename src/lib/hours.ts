/** Paris-local service windows for Namasté Gien (closed Mondays). */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const LUNCH = ["11:30", "12:00", "12:30", "13:00", "13:30"];
const DINNER = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const DINNER_LATE = [...DINNER, "21:30"];

export const WEEKLY: Record<Weekday, { lunch: string[]; dinner: string[] } | null> = {
  0: { lunch: LUNCH, dinner: DINNER },
  1: null,
  2: { lunch: LUNCH, dinner: DINNER },
  3: { lunch: LUNCH, dinner: DINNER },
  4: { lunch: LUNCH, dinner: DINNER },
  5: { lunch: LUNCH, dinner: DINNER_LATE },
  6: { lunch: LUNCH, dinner: DINNER_LATE },
};

export const HOURS_FR: Record<Weekday, string> = {
  0: "11h30 – 14h30 · 18h30 – 22h00",
  1: "Fermé",
  2: "11h30 – 14h30 · 18h30 – 22h00",
  3: "11h30 – 14h30 · 18h30 – 22h00",
  4: "11h30 – 14h30 · 18h30 – 22h00",
  5: "11h30 – 14h30 · 18h30 – 22h30",
  6: "11h30 – 14h30 · 18h30 – 22h30",
};

export const HOURS_EN: Record<Weekday, string> = {
  0: "11:30–14:30 · 18:30–22:00",
  1: "Closed",
  2: "11:30–14:30 · 18:30–22:00",
  3: "11:30–14:30 · 18:30–22:00",
  4: "11:30–14:30 · 18:30–22:00",
  5: "11:30–14:30 · 18:30–22:30",
  6: "11:30–14:30 · 18:30–22:30",
};

export const DAY_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
export const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function parisNow(): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return new Date(`${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}:${g("second")}`);
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isClosedOn(d: Date): boolean {
  return WEEKLY[d.getDay() as Weekday] === null;
}

export function isOpenNow(now = parisNow()): boolean {
  if (isClosedOn(now)) return false;
  const min = now.getHours() * 60 + now.getMinutes();
  const lunch = min >= 11 * 60 + 15 && min <= 14 * 60 + 45;
  const end = now.getDay() === 5 || now.getDay() === 6 ? 22 * 60 + 45 : 22 * 60 + 15;
  const dinner = min >= 18 * 60 + 15 && min <= end;
  return lunch || dinner;
}

function parseHM(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function quarterSlots(start: string, end: string): string[] {
  const out: string[] = [];
  for (let m = parseHM(start); m <= parseHM(end); m += 15) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}

export function orderSlots(date: Date, fulfillment: "pickup" | "delivery", now = parisNow()): string[] {
  if (isClosedOn(date)) return [];
  const lunch = quarterSlots("11:45", "14:15");
  const dinnerEnd = date.getDay() === 5 || date.getDay() === 6 ? "22:15" : "21:45";
  const dinner = quarterSlots("18:45", dinnerEnd);
  const slots = [...lunch, ...dinner];
  const lead = fulfillment === "delivery" ? 40 : 20;
  if (isoDate(date) !== isoDate(now)) return slots;
  const cutoff = now.getHours() * 60 + now.getMinutes() + lead;
  return slots.filter((t) => parseHM(t) >= cutoff);
}

export function reservationSlots(date: Date, now = parisNow()): string[] {
  const w = WEEKLY[date.getDay() as Weekday];
  if (!w) return [];
  const slots = [...w.lunch, ...w.dinner];
  if (isoDate(date) !== isoDate(now)) return slots;
  const cutoff = now.getHours() * 60 + now.getMinutes() + 45;
  return slots.filter((t) => parseHM(t) >= cutoff);
}

export function nextOpenDates(from: Date, count: number): string[] {
  const out: string[] = [];
  let d = new Date(from);
  d.setHours(12, 0, 0, 0);
  while (out.length < count) {
    if (!isClosedOn(d)) out.push(isoDate(d));
    d = addDays(d, 1);
  }
  return out;
}
