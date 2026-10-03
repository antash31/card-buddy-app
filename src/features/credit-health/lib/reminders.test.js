/* global test, expect, describe */
import { buildReminders, ID_PREFIX, MAX_REMINDERS, remindAt } from './reminders';

// 3 Oct 2026, 10:00 on the device's clock.
const NOW = new Date(2026, 9, 3, 10, 0, 0);

const card = (over = {}) => ({
  userCardId: 'u1',
  bank: 'HDFC',
  cardName: 'Infinia',
  status: 'within',
  upcoming: {
    statements: ['2026-10-12', '2026-11-12', '2026-12-12'],
    dues: ['2026-10-30', '2026-11-30', '2026-12-30'],
  },
  ...over,
});

const at = (y, m, d, h = 9) => new Date(y, m - 1, d, h, 0, 0, 0).getTime();

describe('when to remind', () => {
  test('is 9am, two days before a statement and three before a due date', () => {
    const reminders = buildReminders([card()], NOW);
    const find = (kind, date) => reminders.find((r) => r.id.endsWith(`:${kind}:${date}`));

    expect(find('statement', '2026-10-12').date.getTime()).toBe(at(2026, 10, 10));
    expect(find('due', '2026-10-30').date.getTime()).toBe(at(2026, 10, 27));
    expect(find('statement', '2026-11-12').date.getTime()).toBe(at(2026, 11, 10));
  });

  test('crosses a month boundary when counting back', () => {
    expect(remindAt('2026-11-01', 2, NOW).getTime()).toBe(at(2026, 10, 30));
    expect(remindAt('2027-01-02', 3, new Date(2026, 11, 1)).getTime()).toBe(at(2026, 12, 30));
  });

  test('catches up to the next morning when the planned moment has passed but the date has not', () => {
    // Statement on 4 Oct: the planned 2 Oct 9am is gone; tomorrow 9am is still before the statement.
    expect(remindAt('2026-10-04', 2, NOW).getTime()).toBe(at(2026, 10, 4));
    // A due date 2 days out was meant to be reminded yesterday; remind tomorrow morning instead.
    expect(remindAt('2026-10-05', 3, NOW).getTime()).toBe(at(2026, 10, 4));
  });

  test('reminds this morning for an event today if 9am has not come yet', () => {
    expect(remindAt('2026-10-03', 3, new Date(2026, 9, 3, 8, 0)).getTime()).toBe(at(2026, 10, 3));
  });

  test('says nothing once it is too late to help', () => {
    expect(remindAt('2026-10-03', 3, NOW)).toBeNull(); // today, and 9am has gone
    expect(remindAt('2026-10-02', 2, NOW)).toBeNull(); // yesterday
  });

  test('never schedules a moment in the past', () => {
    for (const reminder of buildReminders([card()], NOW)) expect(reminder.date.getTime()).toBeGreaterThan(NOW.getTime());
  });
});

describe('what is scheduled', () => {
  test('one reminder per upcoming statement and due date, soonest first', () => {
    const reminders = buildReminders([card()], NOW);
    expect(reminders).toHaveLength(6);
    const times = reminders.map((r) => r.date.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  test('ids are stable, unique and scoped to this feature, so a re-sync replaces rather than duplicates', () => {
    const first = buildReminders([card(), card({ userCardId: 'u2' })], NOW).map((r) => r.id);
    const second = buildReminders([card(), card({ userCardId: 'u2' })], NOW).map((r) => r.id);
    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(first.length);
    for (const id of first) expect(id.startsWith(ID_PREFIX)).toBe(true);
    expect(first).toContain(`${ID_PREFIX}u1:statement:2026-10-12`);
    expect(first).toContain(`${ID_PREFIX}u2:due:2026-10-30`);
  });

  test('skips a card with no statement day', () => {
    expect(buildReminders([card({ upcoming: null })], NOW)).toEqual([]);
  });

  test('reminds for statements alone when there is no due day', () => {
    const reminders = buildReminders([card({ upcoming: { statements: ['2026-10-12'], dues: [] } })], NOW);
    expect(reminders).toHaveLength(1);
    expect(reminders[0].id).toContain(':statement:');
  });

  test('sends a tapped reminder to the CIBIL Protector screen, for that card', () => {
    for (const reminder of buildReminders([card()], NOW)) {
      expect(reminder.data).toEqual({ screen: 'credit-health', userCardId: 'u1' });
    }
  });

  test('names the card and the date', () => {
    const [statement] = buildReminders([card({ upcoming: { statements: ['2026-10-12'], dues: [] } })], NOW);
    expect(statement.title).toBe('Statement on 12 Oct');
    expect(statement.body).toContain('HDFC Infinia');
    const [due] = buildReminders([card({ upcoming: { statements: [], dues: ['2026-10-30'] } })], NOW);
    expect(due.title).toBe('Payment due 30 Oct');
    expect(due.body).toContain('pay the full statement amount by 30 Oct');
  });
});

describe('what the text may claim', () => {
  test('notes an over-the-limit card only on its first statement, and only as of the last check', () => {
    const reminders = buildReminders([card({ status: 'above' })], NOW);
    const statements = reminders.filter((r) => r.id.includes(':statement:'));
    expect(statements[0].body).toContain('over 30% of its limit when you last checked');
    expect(statements[1].body).not.toContain('over 30%');
    expect(statements[2].body).not.toContain('over 30%');
    expect(buildReminders([card({ status: 'within' })], NOW)[0].body).not.toContain('over 30%');
  });

  test('never states a rupee amount, which could be stale by the time it is read', () => {
    for (const status of ['above', 'within', 'limit_only', 'setup_needed']) {
      for (const reminder of buildReminders([card({ status })], NOW)) {
        expect(reminder.title).not.toMatch(/Rs\.|₹|\d,\d{2}/);
        expect(reminder.body).not.toMatch(/Rs\.|₹|\d,\d{2}/);
      }
    }
  });
});

describe('the platform limit', () => {
  test('keeps the soonest reminders when there are more than the platform allows', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      card({
        userCardId: `c${i}`,
        upcoming: {
          statements: ['2026-10-12', '2026-11-12', '2026-12-12'],
          dues: ['2026-10-30', '2026-11-30', '2026-12-30'],
        },
      }),
    );
    const reminders = buildReminders(many, NOW);
    expect(reminders).toHaveLength(MAX_REMINDERS);
    expect(MAX_REMINDERS).toBeLessThan(64);
    // The 72 that exist span three months; the ones dropped are the furthest away.
    const latest = Math.max(...reminders.map((r) => r.date.getTime()));
    expect(latest).toBeLessThanOrEqual(at(2026, 12, 27));
  });
});
