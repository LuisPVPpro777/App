// Agenda logic helpers — Monday-based week, CrossFit sessions, Maison computation

export const WEEK_DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
export const WEEK_DAYS_LONG = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Hour slots from 06:00 to 22:30 in 30-minute steps
export const SLOT_START_HOUR = 6;
export const SLOT_END_HOUR = 23; // exclusive => last slot starts at 22:30
export const SLOT_COUNT = (SLOT_END_HOUR - SLOT_START_HOUR) * 2; // 34
export const MAISON_HOUR = 18; // 18:00

export const slotToMinutes = (slot) =>
  SLOT_START_HOUR * 60 + slot * 30;

export const minutesToSlotIndex = (mins) => {
  if (mins < SLOT_START_HOUR * 60) return -1;
  const idx = Math.floor((mins - SLOT_START_HOUR * 60) / 30);
  return idx >= 0 && idx < SLOT_COUNT ? idx : -1;
};

export const slotLabel = (slot) => {
  const m = slotToMinutes(slot);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

// returns Monday 00:00 of the week containing date d
export const mondayOf = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=Sun, 1=Mon, ...
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return date;
};

export const isoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Return the day-of-week index (0=Mon ... 6=Sun) for the given Date object
export const dayIndex = (d = new Date()) => {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
};

// Compute Maison days from CrossFit days.
// Rule: Maison happens at 18:00 the day after CrossFit. If 2 consecutive CrossFit days,
// Maison shifts to the first day without sport.
export const computeMaisonDays = (crossfitDays) => {
  // crossfitDays: boolean[7]
  const maison = Array(7).fill(false);
  for (let d = 0; d < 7; d++) {
    if (!crossfitDays[d]) continue;
    // Skip if the next day is also a CrossFit day → defer
    let target = d + 1;
    while (target < 7 && crossfitDays[target]) {
      target += 1;
    }
    if (target < 7 && !maison[target]) {
      maison[target] = true;
    }
  }
  return maison;
};

// detect if 'now' falls within any scheduled CrossFit session today
// crossfitSlots: { [dayIndex]: number[] } => array of slot indexes that are session-starts (each session = 1h => 2 slots)
export const isNowInSession = (sessions, now = new Date()) => {
  const di = dayIndex(now);
  const mins = now.getHours() * 60 + now.getMinutes();
  const todayStarts = sessions[di] || [];
  for (const slot of todayStarts) {
    const startMin = slotToMinutes(slot);
    const endMin = startMin + 60;
    if (mins >= startMin && mins < endMin) {
      return { active: true, startMin, endMin };
    }
  }
  return { active: false };
};
