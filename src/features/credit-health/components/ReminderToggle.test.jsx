/* global jest, test, expect, beforeEach, describe */
// #genai: The reminders switch: it asks the system for permission when turned on, and says so
// plainly when the system refuses rather than showing a switch that looks on and does nothing.
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ReminderToggle } from './ReminderToggle';
import { useReminderStore } from '../store/reminderStore';

const mockRequestPermission = jest.fn();
let mockSupported = true;

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@expo-google-fonts/manrope', () => ({
  Manrope_500Medium: 'Manrope_500Medium',
  Manrope_600SemiBold: 'Manrope_600SemiBold',
  Manrope_700Bold: 'Manrope_700Bold',
  Manrope_800ExtraBold: 'Manrope_800ExtraBold',
}));
jest.mock('expo-secure-store', () => ({}));
jest.mock('@/lib/haptics', () => ({ haptics: {}, fireHaptic: jest.fn() }));
jest.mock('@/lib/notifications', () => ({
  get notificationsSupported() {
    return mockSupported;
  },
  requestPermission: (...args) => mockRequestPermission(...args),
}));
jest.mock('@/components/motion/PressableScale', () => {
  const { Pressable } = require('react-native');
  return { PressableScale: ({ children, ...props }) => <Pressable {...props}>{children}</Pressable> };
});

const flip = (value) => act(async () => fireEvent(screen.getByLabelText('Reminders'), 'valueChange', value));

beforeEach(() => {
  mockRequestPermission.mockReset();
  mockSupported = true;
  useReminderStore.setState({ enabled: false, hydrated: true });
});

describe('turning reminders on', () => {
  test('asks for permission, and turns on once it is granted', async () => {
    mockRequestPermission.mockResolvedValue('granted');
    render(<ReminderToggle hasDates />);

    await flip(true);

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    expect(useReminderStore.getState().enabled).toBe(true);
    expect(screen.queryByText(/turned off for Card Buddy/)).toBeNull();
  });

  test.each([['denied'], ['undetermined']])('stays off, and says why, when the system answers %s', async (status) => {
    mockRequestPermission.mockResolvedValue(status);
    render(<ReminderToggle hasDates />);

    await flip(true);

    expect(useReminderStore.getState().enabled).toBe(false);
    expect(screen.getByText(/Notifications are turned off for Card Buddy/)).toBeTruthy();
    expect(screen.getByText('Open Settings')).toBeTruthy();
  });

  test('clears the warning once permission is granted later', async () => {
    mockRequestPermission.mockResolvedValueOnce('denied').mockResolvedValueOnce('granted');
    render(<ReminderToggle hasDates />);

    await flip(true);
    expect(screen.getByText('Open Settings')).toBeTruthy();

    await flip(true);
    expect(screen.queryByText('Open Settings')).toBeNull();
    expect(useReminderStore.getState().enabled).toBe(true);
  });
});

describe('turning reminders off', () => {
  test('does not ask for anything', async () => {
    useReminderStore.setState({ enabled: true });
    render(<ReminderToggle hasDates />);

    await flip(false);

    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(useReminderStore.getState().enabled).toBe(false);
  });
});

describe('what it tells the user', () => {
  test('explains the timing when on, and the benefit when off', () => {
    const { rerender } = render(<ReminderToggle hasDates />);
    expect(screen.getByText(/before each statement and due date/)).toBeTruthy();

    act(() => useReminderStore.setState({ enabled: true }));
    rerender(<ReminderToggle hasDates />);
    expect(screen.getByText(/At 9am, 2 days before each statement and 3 days before each payment due date/)).toBeTruthy();
  });

  test('points out that there is nothing to remind about until a statement day is set', () => {
    render(<ReminderToggle hasDates={false} />);
    expect(screen.getByText(/Add a statement day to a card first/)).toBeTruthy();
  });

  test('is absent where local notifications are not available', () => {
    mockSupported = false;
    render(<ReminderToggle hasDates />);
    expect(screen.queryByText('Reminders')).toBeNull();
  });
});
