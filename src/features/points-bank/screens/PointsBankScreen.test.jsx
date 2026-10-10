/* global jest, test, expect, beforeEach */
// #genai: Renders Points Bank with a fixture bank, so a missing theme token or a broken prop fails
// here rather than on a device. Network and navigation are stubbed; the components are real.
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PointsBankScreen } from './PointsBankScreen';

const mockMutate = jest.fn();
const mockReset = jest.fn();
let mockBank;
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
jest.mock('../hooks/usePointsBank', () => ({
  usePointsBank: () => mockBank,
  useSaveBalance: () => mockSave,
}));
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
      <PointsBankScreen />
    </SafeAreaProvider>,
  );
}

const route = (over = {}) => ({
  code: 'cashback_statement',
  destination: 'card_statement',
  pointValue: 0.3,
  friction: 0,
  effectiveValue: 0.3,
  isDefault: true,
  minPoints: null,
  fee: null,
  maxCoveragePct: null,
  monthlyCapPoints: null,
  expiryMonths: null,
  limited: false,
  ...over,
});

const smartbuy = route({ code: 'travel_smartbuy', destination: 'travel_booking', pointValue: 1, effectiveValue: 1, isDefault: false, maxCoveragePct: 70, monthlyCapPoints: 150000, expiryMonths: 36, limited: true });

const card = (over) => ({
  userCardId: 'u',
  cardId: 'c',
  bank: 'HDFC',
  cardName: 'Test Card',
  network: 'Visa',
  balanceUpdatedAt: null,
  status: 'ok',
  routes: [route()],
  defaultRoute: route(),
  bestRoute: route(),
  balance: null,
  valuation: null,
  ...over,
});

const bankFixture = () => ({
  cards: [
    card({
      userCardId: 'rich',
      cardName: 'Rich Card',
      balance: 10000,
      balanceUpdatedAt: new Date().toISOString(),
      routes: [smartbuy, route()],
      bestRoute: smartbuy,
      defaultRoute: route(),
      valuation: { atDefault: 3000, atBest: 10000, bestRouteCode: 'travel_smartbuy', bestIsLimited: true, belowDefaultMinimum: false },
    }),
    card({ userCardId: 'empty', cardName: 'Empty Card' }),
    card({ userCardId: 'none', cardName: 'Unknown Card', status: 'no_routes', routes: [], defaultRoute: null, bestRoute: null }),
  ],
  totals: { cardsWithBalance: 1, valuedCards: 1, defaultCards: 1, atBest: 10000, atDefault: 3000 },
});

beforeEach(() => {
  mockMutate.mockReset();
  mockReset.mockReset();
  mockBank = { isPending: false, error: null, data: bankFixture(), refetch: jest.fn() };
  mockSave = { mutate: mockMutate, reset: mockReset, isPending: false, error: null };
});

test('shows the headline as "up to", with the cash figure beneath', () => {
  renderScreen();

  expect(screen.getByText('What your points are worth')).toBeTruthy();
  expect(screen.getByText('Your points are worth')).toBeTruthy();
  expect(screen.getByText('Rs.3,000 if you take it all as statement credit.')).toBeTruthy();
});

test('values a balance at the best route and as cash, and labels the best figure "at most"', () => {
  renderScreen();

  expect(screen.getByText('At most')).toBeTruthy();
  expect(screen.getByText('Taken as cash')).toBeTruthy();
  expect(screen.getByText(/Travel Smartbuy · Rs\.1 a point · may take more than one redemption/)).toBeTruthy();
  expect(screen.getByText(/Statement credit · Rs\.0\.3 a point/)).toBeTruthy();
});

test('lists every route with its limits when asked', () => {
  renderScreen();

  fireEvent.press(screen.getAllByText(/All routes/)[0]);
  expect(screen.getByText('Covers up to 70% of the amount')).toBeTruthy();
  expect(screen.getByText('Up to 1,50,000 points a month')).toBeTruthy();
  expect(screen.getByText('Expiry: 36 months')).toBeTruthy();
  expect(screen.getByText('DEFAULT')).toBeTruthy();
});

test('says a card with no catalog data has none, and offers no balance entry for it', () => {
  renderScreen();

  expect(screen.getByText('There is no redemption data for this card yet.')).toBeTruthy();
  // One "Enter balance" button, for the card that has routes but no balance, and an "Edit balance" for the rich one.
  expect(screen.getAllByText('Enter balance')).toHaveLength(1);
  expect(screen.getAllByText('Edit balance')).toHaveLength(1);
});

test('opens the form, refuses a bad balance, and sends a number for a good one', () => {
  renderScreen();

  fireEvent.press(screen.getByText('Enter balance'));
  expect(mockReset).toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText('Points balance'), 'lots');
  fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText('Enter a number, such as 12400.')).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText('Points balance'), '12,400');
  fireEvent.press(screen.getByText('Save'));
  expect(mockMutate).toHaveBeenCalledTimes(1);
  expect(mockMutate.mock.calls[0][0]).toEqual({ userCardId: 'empty', balance: 12400 });
});

test('a blank field clears the balance', () => {
  renderScreen();

  fireEvent.press(screen.getByText('Edit balance'));
  fireEvent.changeText(screen.getByLabelText('Points balance'), '');
  fireEvent.press(screen.getByText('Save'));
  expect(mockMutate.mock.calls[0][0]).toEqual({ userCardId: 'rich', balance: null });
});

test('says there is nothing to value yet when no balance is entered', () => {
  mockBank = {
    ...mockBank,
    data: { cards: [card({ userCardId: 'a' })], totals: { cardsWithBalance: 0, valuedCards: 0, defaultCards: 0, atBest: 0, atDefault: 0 } },
  };
  renderScreen();

  expect(screen.getByText('Nothing to value yet')).toBeTruthy();
  expect(screen.getByText('Enter a balance for a card to see what it comes to.')).toBeTruthy();
});

test('asks for cards first when the nest is empty', () => {
  mockBank = { ...mockBank, data: { cards: [], totals: { cardsWithBalance: 0, valuedCards: 0, defaultCards: 0, atBest: 0, atDefault: 0 } } };
  renderScreen();

  expect(screen.getByText('Find your first card')).toBeTruthy();
});

test('explains what the figures are and are not', () => {
  renderScreen();

  fireEvent.press(screen.getByText('How this works'));
  expect(screen.getByText(/does not set them and cannot see your bank account/)).toBeTruthy();
  expect(screen.getByText(/only true if you use that route/)).toBeTruthy();
});

test('offers a retry when the first load fails', () => {
  mockBank = { isPending: true, error: new Error('Network down'), data: undefined, refetch: jest.fn() };
  renderScreen();

  expect(screen.getByText('Network down')).toBeTruthy();
  fireEvent.press(screen.getByText('Try again'));
  expect(mockBank.refetch).toHaveBeenCalled();
});
