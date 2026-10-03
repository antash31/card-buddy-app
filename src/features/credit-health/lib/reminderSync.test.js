/* global jest, test, expect, describe, beforeEach */
import { ID_PREFIX } from './reminders';
import { clearReminders, syncReminders } from './reminderSync';

jest.mock('@/lib/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/notifications', () => ({}));

const NOW = new Date(2026, 9, 3, 10, 0, 0);

const overview = () => ({
  cards: [
    {
      userCardId: 'u1',
      bank: 'HDFC',
      cardName: 'Infinia',
      status: 'within',
      upcoming: { statements: ['2026-10-12', '2026-11-12'], dues: ['2026-10-30'] },
    },
  ],
});

let calls;
let api;

beforeEach(() => {
  calls = [];
  api = {
    getPermission: jest.fn(async () => 'granted'),
    cancelByPrefix: jest.fn(async (prefix) => void calls.push(['cancel', prefix])),
    scheduleAt: jest.fn(async (reminder) => void calls.push(['schedule', reminder.id])),
    countByPrefix: jest.fn(async () => 3),
  };
});

describe('syncing reminders', () => {
  test('clears the old reminders, then schedules the current ones', async () => {
    const result = await syncReminders({ overview: overview(), enabled: true, now: NOW, api });

    expect(result).toEqual({ scheduled: 3 });
    expect(calls[0]).toEqual(['cancel', ID_PREFIX]);
    expect(calls.slice(1).map(([kind]) => kind)).toEqual(['schedule', 'schedule', 'schedule']);
  });

  test('clears everything and schedules nothing when reminders are off', async () => {
    const result = await syncReminders({ overview: overview(), enabled: false, now: NOW, api });

    expect(result).toEqual({ scheduled: 0, reason: 'disabled' });
    expect(api.cancelByPrefix).toHaveBeenCalledWith(ID_PREFIX);
    expect(api.scheduleAt).not.toHaveBeenCalled();
    expect(api.getPermission).not.toHaveBeenCalled();
  });

  test('leaves existing reminders alone when there is no data to build from', async () => {
    const result = await syncReminders({ overview: undefined, enabled: true, now: NOW, api });

    expect(result).toEqual({ scheduled: 0, reason: 'no-data' });
    expect(api.cancelByPrefix).not.toHaveBeenCalled();
    expect(api.scheduleAt).not.toHaveBeenCalled();
  });

  test('schedules nothing, and removes stale reminders, when the system has not granted permission', async () => {
    for (const status of ['denied', 'undetermined']) {
      api.getPermission.mockResolvedValue(status);
      api.cancelByPrefix.mockClear();
      const result = await syncReminders({ overview: overview(), enabled: true, now: NOW, api });

      expect(result).toEqual({ scheduled: 0, reason: 'permission' });
      expect(api.cancelByPrefix).toHaveBeenCalledWith(ID_PREFIX);
      expect(api.scheduleAt).not.toHaveBeenCalled();
    }
  });

  test('one notification that fails to schedule does not stop the rest', async () => {
    api.scheduleAt.mockImplementationOnce(async () => {
      throw new Error('boom');
    });
    const result = await syncReminders({ overview: overview(), enabled: true, now: NOW, api });

    expect(result).toEqual({ scheduled: 2 });
    expect(api.scheduleAt).toHaveBeenCalledTimes(3);
  });

  test('running twice ends with the same set of ids, so a re-sync replaces rather than piles up', async () => {
    await syncReminders({ overview: overview(), enabled: true, now: NOW, api });
    const first = calls.filter(([kind]) => kind === 'schedule').map(([, id]) => id);
    calls.length = 0;
    await syncReminders({ overview: overview(), enabled: true, now: NOW, api });
    const second = calls.filter(([kind]) => kind === 'schedule').map(([, id]) => id);

    expect(second).toEqual(first);
  });
});

describe('signing out', () => {
  test('cancels this feature’s reminders', async () => {
    await clearReminders(api);
    expect(api.cancelByPrefix).toHaveBeenCalledWith(ID_PREFIX);
  });
});
