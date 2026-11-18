import {
  dailyActivityId,
  effectiveStreak,
  practiceAccuracy,
  previousStudyDay,
  streakFromDays,
  studyDay,
} from '@/features/learning/studyDay';

describe('study days (UTC+2, as the server counts them)', () => {
  test('a study day starts at 22:00 UTC', () => {
    expect(studyDay(new Date('2026-10-16T21:59:00Z'))).toBe('2026-10-16');
    expect(studyDay(new Date('2026-10-16T22:00:00Z'))).toBe('2026-10-17');
  });

  test('previous day crosses month and year boundaries', () => {
    expect(previousStudyDay('2026-11-01')).toBe('2026-10-31');
    expect(previousStudyDay('2027-01-01')).toBe('2026-12-31');
    expect(previousStudyDay('2028-03-01')).toBe('2028-02-29');
  });
});

describe('streak as it stands today', () => {
  const today = '2026-10-17';

  test('kept when last active today or yesterday', () => {
    expect(effectiveStreak(4, '2026-10-17', today)).toBe(4);
    expect(effectiveStreak(4, '2026-10-16', today)).toBe(4);
  });

  test('a missed day shows 0, not the stale stored number', () => {
    expect(effectiveStreak(4, '2026-10-15', today)).toBe(0);
    expect(effectiveStreak(4, null, today)).toBe(0);
    expect(effectiveStreak(0, today, today)).toBe(0);
  });

  test('device streak counts consecutive days ending today or yesterday', () => {
    expect(streakFromDays(['2026-10-17', '2026-10-16', '2026-10-15', '2026-10-13'], today)).toBe(3);
    expect(streakFromDays(['2026-10-16', '2026-10-15'], today)).toBe(2);
    expect(streakFromDays(['2026-10-17', '2026-10-17'], today)).toBe(1);
    expect(streakFromDays(['2026-10-14'], today)).toBe(0);
    expect(streakFromDays([], today)).toBe(0);
  });
});

describe('practice accuracy (not mastery)', () => {
  test('hidden below 5 checked answers', () => {
    expect(practiceAccuracy(0, 0)).toBeNull();
    expect(practiceAccuracy(4, 4)).toBeNull();
  });

  test('a rounded share of correct answers', () => {
    expect(practiceAccuracy(5, 4)).toBe(80);
    expect(practiceAccuracy(12, 9)).toBe(75);
    expect(practiceAccuracy(3 * 3, 2)).toBe(22);
  });
});

describe('once-per-day activity ids', () => {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  test('the same learner, kind, item and day give the same valid UUID', () => {
    const a = dailyActivityId('user-1', 'explore', 'area-lab', '2026-10-17');
    expect(a).toMatch(uuid);
    expect(dailyActivityId('user-1', 'explore', 'area-lab', '2026-10-17')).toBe(a);
  });

  test('a different day, item, kind or learner gives a different id', () => {
    const a = dailyActivityId('user-1', 'explore', 'area-lab', '2026-10-17');
    const others = [
      dailyActivityId('user-1', 'explore', 'area-lab', '2026-10-18'),
      dailyActivityId('user-1', 'explore', 'rn-lab', '2026-10-17'),
      dailyActivityId('user-1', 'practice', 'area-lab', '2026-10-17'),
      dailyActivityId('user-2', 'explore', 'area-lab', '2026-10-17'),
    ];
    for (const id of others) {
      expect(id).toMatch(uuid);
      expect(id).not.toBe(a);
    }
  });
});
