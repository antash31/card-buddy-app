/* global jest, test, expect, beforeEach */
// #genai: Renders CIBIL Protector with a fixture overview, so a missing theme token or a broken prop
// fails here rather than on a device. Network and navigation are stubbed; the components are real.
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CreditHealthScreen } from './CreditHealthScreen';

const mockMutate = jest.fn();
const mockReset = jest.fn();
let mockHealth;
let mockSave;

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
// The font package pulls in expo-asset, which jest cannot resolve; the theme only needs the names.
jest.mock('@expo-google-fonts/manrope', () => ({
  Manrope_500Medium: 'Manrope_500Medium',
  Manrope_600SemiBold: 'Manrope_600SemiBold',
  Manrope_700Bold: 'Manrope_700Bold',
  Manrope_800ExtraBold: 'Manrope_800ExtraBold',
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true }),
  useFocusEffect: jest.fn(),
}));
jest.mock('../hooks/useCreditHealth', () => ({
  useCreditHealth: () => mockHealth,
  useSaveCreditProfile: () => mockSave,
}));
// Motion wrappers are exercised elsewhere; here they only need to render their children.
jest.mock('@/components/motion/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('@/components/motion/PressableScale', () => {
  const { Pressable } = require('react-native');
  return { PressableScale: ({ children, ...props }) => <Pressable {...props}>{children}</Pressable> };
});
jest.mock('@/lib/haptics', () => ({ haptics: { success: jest.fn(), error: jest.fn() }, fireHaptic: jest.fn() }));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CreditHealthScreen />
    </SafeAreaProvider>,
  );
}

const cycle = { start: '2026-09-13', end: '2026-10-12', lastStatementDate: '2026-09-12', daysToStatement: 9 };
const blank = { creditLimit: null, statementDay: null, paymentDueDay: null };

const card = (over) => ({
  userCardId: 'u',
  cardId: 'c',
  bank: 'HDFC',
  cardName: 'Test Card',
  network: 'Visa',
  profile: blank,
  status: 'setup_needed',
  ceiling: null,
  cycle: null,
  due: null,
  spent: null,
  utilisationPct: null,
  headroom: null,
  payDown: null,
  ...over,
});

const overview = () => ({
  threshold: 0.3,
  asOf: '2026-10-03',
  overall: { measuredCards: 2, totalLimit: 300000, totalSpent: 100000, utilisationPct: 33.33, ceiling: 90000, status: 'above' },
  cards: [
    card({
      userCardId: 'over',
      cardName: 'Over Card',
      profile: { creditLimit: 200000, statementDay: 12, paymentDueDay: 30 },
      status: 'above',
      ceiling: 60000,
      cycle,
      due: { date: '2026-10-30', daysToDue: 27, forStatement: 'upcoming' },
      spent: 85000,
      utilisationPct: 42.5,
      headroom: -25000,
      payDown: 25000,
    }),
    card({
      userCardId: 'fine',
      cardName: 'Fine Card',
      profile: { creditLimit: 100000, statementDay: 20, paymentDueDay: null },
      status: 'within',
      ceiling: 30000,
      cycle: { ...cycle, end: '2026-10-20', daysToStatement: 17 },
      spent: 15000,
      utilisationPct: 15,
      headroom: 15000,
      payDown: 0,
    }),
    card({ userCardId: 'new', cardName: 'New Card' }),
  ],
});

beforeEach(() => {
  mockMutate.mockReset();
  mockReset.mockReset();
  mockHealth = { isPending: false, error: null, data: overview(), refetch: jest.fn() };
  mockSave = { mutate: mockMutate, reset: mockReset, isPending: false, error: null };
});

test('shows the wallet headline and each card’s state in words', () => {
  renderScreen();

  expect(screen.getByText('Stay under 30%')).toBeTruthy();
  expect(screen.getByText('Across your cards')).toBeTruthy();
  expect(screen.getByText('Over 30%')).toBeTruthy();
  expect(screen.getByText('Under 30%')).toBeTruthy();
  expect(screen.getByText('Set up')).toBeTruthy();
});

test('tells the over-the-ceiling card how much to pay and by when', () => {
  renderScreen();

  expect(screen.getByText(/Paying about Rs\.25,000 before 12 Oct/)).toBeTruthy();
  expect(screen.getByText('Statement in 9 days · 12 Oct')).toBeTruthy();
  expect(screen.getByText('Payment due in 27 days · 30 Oct')).toBeTruthy();
});

test('invites a card with no limit to add one instead of showing empty figures', () => {
  renderScreen();

  expect(screen.getByText('Add limit and dates')).toBeTruthy();
  expect(screen.getAllByText('Edit details')).toHaveLength(2);
});

test('opens the form, refuses a bad limit, and sends all three fields for a good one', () => {
  renderScreen();

  fireEvent.press(screen.getByText('Add limit and dates'));
  expect(mockReset).toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText('Credit limit (Rs.)'), '500');
  fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText(/at least Rs\.1,000/)).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText('Credit limit (Rs.)'), '1,50,000');
  fireEvent.changeText(screen.getByLabelText('Statement day'), '12');
  fireEvent.press(screen.getByText('Save'));

  expect(mockMutate).toHaveBeenCalledTimes(1);
  expect(mockMutate.mock.calls[0][0]).toEqual({
    userCardId: 'new',
    body: { creditLimit: 150000, statementDay: 12, paymentDueDay: null },
  });
});

test('explains the limits of the figures', () => {
  renderScreen();

  fireEvent.press(screen.getByText('How this works'));
  expect(screen.getByText(/not a credit score/)).toBeTruthy();
  expect(screen.getByText(/cannot see a balance carried from the last statement/)).toBeTruthy();
});

test('says there is nothing to measure when no card is set up', () => {
  mockHealth = {
    ...mockHealth,
    data: { threshold: 0.3, asOf: '2026-10-03', overall: null, cards: [card({ userCardId: 'a' })] },
  };
  renderScreen();

  expect(screen.getByText('Nothing to measure yet')).toBeTruthy();
});

test('asks for cards first when the nest is empty', () => {
  mockHealth = { ...mockHealth, data: { threshold: 0.3, asOf: '2026-10-03', overall: null, cards: [] } };
  renderScreen();

  expect(screen.getByText('Find your first card')).toBeTruthy();
});

test('offers a retry when the first load fails', () => {
  mockHealth = { isPending: true, error: new Error('Network down'), data: undefined, refetch: jest.fn() };
  renderScreen();

  expect(screen.getByText('Network down')).toBeTruthy();
  fireEvent.press(screen.getByText('Try again'));
  expect(mockHealth.refetch).toHaveBeenCalled();
});
