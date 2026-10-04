/* global jest, test, expect, beforeEach, describe */
// #genai: The shell component that keeps reminders scheduled. It renders nothing, so the tests watch
// what it asks of the rest of the app: when it syncs, when it stays quiet, and where a tap goes.
import { render } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { ReminderSync } from './ReminderSync';
import { useReminderStore } from '../store/reminderStore';

const mockPush = jest.fn();
const mockInvalidate = jest.fn();
const mockSync = jest.fn();
const mockUseCreditOverview = jest.fn();
let mockStatus = 'authenticated';
let mockOpenedHandler = null;
const mockUnsubscribeOpened = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => ({}));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ invalidateQueries: mockInvalidate }) }));
jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector) => selector({ status: mockStatus }),
}));
jest.mock('@/lib/logger', () => ({ logger: { debug: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/notifications', () => ({
  configureNotifications: jest.fn(),
  onNotificationOpened: (handler) => {
    mockOpenedHandler = handler;
    return mockUnsubscribeOpened;
  },
}));
jest.mock('../hooks/useCreditHealth', () => ({
  creditKeys: { overview: ['credit-health'] },
  useCreditOverview: (...args) => mockUseCreditOverview(...args),
}));
jest.mock('../lib/reminderSync', () => ({ syncReminders: (...args) => mockSync(...args) }));

const overview = { cards: [{ userCardId: 'u1' }] };
let appStateHandler;

beforeEach(() => {
  mockPush.mockReset();
  mockInvalidate.mockReset();
  mockSync.mockReset().mockResolvedValue({ scheduled: 0 });
  mockUseCreditOverview.mockReset().mockReturnValue({ data: overview });
  mockStatus = 'authenticated';
  mockOpenedHandler = null;
  mockUnsubscribeOpened.mockReset();
  appStateHandler = undefined;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    appStateHandler = handler;
    return { remove: jest.fn() };
  });
  // Skip the AsyncStorage round trip: the store's own hydrate is covered in its own test.
  useReminderStore.setState({ enabled: true, hydrated: true, hydrate: jest.fn(async () => undefined) });
});

describe('keeping reminders in step with the data', () => {
  test('syncs the current overview when signed in and the preference is known', () => {
    render(<ReminderSync />);
    expect(mockSync).toHaveBeenCalledWith({ overview, enabled: true });
  });

  test('passes the switch’s state through, so turning it off clears the schedule', () => {
    useReminderStore.setState({ enabled: false });
    render(<ReminderSync />);
    expect(mockSync).toHaveBeenCalledWith({ overview, enabled: false });
  });

  test('waits for the saved preference rather than acting on the default', () => {
    useReminderStore.setState({ hydrated: false });
    render(<ReminderSync />);
    expect(mockSync).not.toHaveBeenCalled();
  });

  test('does nothing, and asks the server for nothing, while signed out', () => {
    mockStatus = 'unauthenticated';
    mockUseCreditOverview.mockReturnValue({ data: undefined });
    render(<ReminderSync />);

    expect(mockUseCreditOverview).toHaveBeenCalledWith({ enabled: false });
    expect(mockSync).not.toHaveBeenCalled();
  });

  test('asks for the data only when signed in', () => {
    render(<ReminderSync />);
    expect(mockUseCreditOverview).toHaveBeenCalledWith({ enabled: true });
  });

  test('a sync that fails is logged, not thrown', async () => {
    mockSync.mockRejectedValue(new Error('scheduling blew up'));
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);

    render(<ReminderSync />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });

  test('hydrates the saved preference on mount', () => {
    const hydrate = jest.fn(async () => undefined);
    useReminderStore.setState({ hydrate });
    render(<ReminderSync />);
    expect(hydrate).toHaveBeenCalledTimes(1);
  });
});

describe('returning to the app', () => {
  test('re-reads the data when the app comes to the foreground, and not when it goes away', () => {
    render(<ReminderSync />);

    appStateHandler('background');
    expect(mockInvalidate).not.toHaveBeenCalled();

    appStateHandler('active');
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['credit-health'] });
  });
});

describe('tapping a reminder', () => {
  test('opens CIBIL Protector', () => {
    render(<ReminderSync />);
    mockOpenedHandler({ screen: 'credit-health', userCardId: 'u1' });
    expect(mockPush).toHaveBeenCalledWith('/credit-health');
  });

  test('ignores a notification that is about something else', () => {
    render(<ReminderSync />);
    mockOpenedHandler({ screen: 'somewhere-else' });
    mockOpenedHandler(undefined);
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('stops listening when it unmounts', () => {
    const { unmount } = render(<ReminderSync />);
    unmount();
    expect(mockUnsubscribeOpened).toHaveBeenCalled();
  });
});
