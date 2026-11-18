/**
 * Study days, streaks and once-per-day activity, matching the server.
 *
 * The streak and XP live in `profiles` and are changed only by the
 * `record_activity` database function, which counts days in the
 * `streak_timezone` from app_config (default Africa/Windhoek, UTC+2 all year,
 * no daylight saving). It keeps the streak on the same day, adds 1 on the next
 * day, and starts again at 1 after a gap, but only when the next activity
 * arrives. So the stored number can be stale: a learner last active five days
 * ago still has their old streak stored. `effectiveStreak` shows the streak as
 * it really stands today.
 *
 * Repeating an activity must not farm XP. `dailyActivityId` gives the same
 * activity id for the same learner, kind and item on the same study day, and
 * `record_activity` ignores an id it already has (no second row, no second XP).
 */

/** Africa/Windhoek is UTC+2 throughout the year. */
const STUDY_DAY_OFFSET_MS = 2 * 60 * 60 * 1000;

/** The study day (YYYY-MM-DD) of a moment, as the server counts days. */
export function studyDay(at: Date = new Date()): string {
  return new Date(at.getTime() + STUDY_DAY_OFFSET_MS).toISOString().slice(0, 10);
}

/** The study day before `day` (YYYY-MM-DD). */
export function previousStudyDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * The streak as it stands today: the stored streak while the learner was active today or
 * yesterday (it can still continue), otherwise 0 (the run of days has been broken).
 */
export function effectiveStreak(stored: number, lastActiveDate: string | null, today: string = studyDay()): number {
  if (!lastActiveDate || stored <= 0) return 0;
  return lastActiveDate === today || lastActiveDate === previousStudyDay(today) ? stored : 0;
}

/**
 * The streak from a set of study days (device-only backend): consecutive days ending today, or
 * yesterday if there is no activity yet today. 0 if the last study day is older.
 */
export function streakFromDays(days: Iterable<string>, today: string = studyDay()): number {
  const set = new Set(days);
  let day = set.has(today) ? today : previousStudyDay(today);
  let count = 0;
  while (set.has(day)) {
    count++;
    day = previousStudyDay(day);
  }
  return count;
}

/** The longest run of consecutive study days (device-only backend; the server keeps profiles.longest_streak). */
export function longestStreakFromDays(days: Iterable<string>): number {
  const set = new Set(days);
  let best = 0;
  for (const day of set) {
    if (set.has(previousStudyDay(day))) continue; // not the start of a run
    let length = 0;
    let d = day;
    while (set.has(d)) {
      length++;
      const next = new Date(`${d}T12:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      d = next.toISOString().slice(0, 10);
    }
    best = Math.max(best, length);
  }
  return best;
}

/** Minimum checked practice answers before an accuracy percentage is shown. */
export const MIN_ANSWERS_FOR_ACCURACY = 5;

/** Share of checked practice answers that were correct, or null with fewer than the minimum. */
export function practiceAccuracy(checked: number, correct: number): number | null {
  return checked >= MIN_ANSWERS_FOR_ACCURACY ? Math.round((100 * correct) / checked) : null;
}

/** 64-bit FNV-1a of a string, as 16 hex digits (two 32-bit halves with different seeds). */
function hash64(text: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x9e3779b9;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x01000193) ^ (a >>> 7);
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}

/**
 * A UUID that is the same for the same learner, kind and item on the same study day, so the
 * server records the activity (and its XP and streak day) once per day however often it is
 * repeated.
 */
export function dailyActivityId(userId: string, kind: string, key: string, day: string = studyDay()): string {
  const base = `${userId}|${kind}|${key}|${day}`;
  const hex = hash64(base) + hash64(`${base}|second`);
  // Shape it as a version-4-style UUID (the database column only needs a valid UUID).
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}
