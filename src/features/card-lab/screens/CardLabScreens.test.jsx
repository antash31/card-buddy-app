/* global jest, test, expect, beforeEach, describe */
// #genai: Renders both Card Lab screens with a fixture lab, so a missing theme token or a broken prop
// fails here rather than on a device. Network and navigation are stubbed; the components are real.
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CardLabCardScreen } from './CardLabCardScreen';
import { CardLabScreen } from './CardLabScreen';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockLab;
let mockParams;

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
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
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => mockParams,
  useFocusEffect: jest.fn(),
}));
jest.mock('../hooks/useCardLab', () => ({ useCardLab: () => mockLab }));
jest.mock('@/components/motion/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('@/components/motion/PressableScale', () => {
  const { Pressable } = require('react-native');
  return { PressableScale: ({ children, ...props }) => <Pressable {...props}>{children}</Pressable> };
});
jest.mock('@/lib/haptics', () => ({ haptics: { success: jest.fn(), error: jest.fn() }, fireHaptic: jest.fn() }));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

const wrap = (node) => render(<SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>);

const facts = { spend: null, period: null, count: null, rupees: null, points: null };

const atlas = {
  userCardId: 'u1',
  cardId: 'c1',
  bank: 'Axis Bank',
  cardName: 'Atlas',
  network: 'Visa',
  cost: { known: true, yearly: 5000, yearlyWithTax: 5900, joining: 5000, joiningWithTax: 5900, skipRule: 'never', skip: null },
  prizes: [
    {
      id: 'p1',
      kind: 'prize',
      lines: ['Spend Rs.3,00,000. The bank then gives you 2,500 Edge Miles.'],
      startsOn: null,
      endsOn: null,
      facts: { ...facts, spend: 300000, points: 2500 },
    },
  ],
  gifts: [],
  lounges: [
    {
      id: 'l1',
      kind: 'lounge',
      lines: ['Free visits to lounges in India: Silver gets 8, Gold gets 12, Platinum gets 18.'],
      startsOn: null,
      endsOn: '2026-12-31',
      facts,
    },
  ],
  extras: [{ id: 'e1', kind: 'extra', lines: null, startsOn: null, endsOn: null, facts }],
};

const freeCard = {
  ...atlas,
  userCardId: 'u2',
  cardId: 'c2',
  bank: 'HDFC',
  cardName: 'Swiggy',
  cost: { known: false, yearly: null, yearlyWithTax: null, joining: null, joiningWithTax: null, skipRule: 'unknown', skip: null },
  prizes: [],
  lounges: [],
  extras: [],
};

const settled = (cards) => ({ isPending: false, error: null, data: { asOf: '2026-10-28', cards }, refetch: jest.fn() });

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
  mockParams = { userCardId: 'u1' };
  mockLab = settled([atlas, freeCard]);
});

describe('the list', () => {
  test('shows every card with its price and counts, and opens a card', () => {
    wrap(<CardLabScreen />);
    expect(screen.getByText('What your cards give you')).toBeTruthy();
    expect(screen.getByText('Rs.5,900 a year · 1 prize · 2 free things')).toBeTruthy();
    expect(screen.getByText('Price not known')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Atlas. Rs.5,900 a year · 1 prize · 2 free things'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/card-lab-card', params: { userCardId: 'u1' } });
  });

  test('asks for a card when the nest is empty', () => {
    mockLab = settled([]);
    wrap(<CardLabScreen />);
    fireEvent.press(screen.getByText('Add a card'));
    expect(mockReplace).toHaveBeenCalledWith('/add-card');
  });
});

describe('a card’s page', () => {
  test('shows the price, the sections with words explained, and what it could not find', () => {
    wrap(<CardLabCardScreen />);
    expect(screen.getByLabelText('Rs.5,900 a year')).toBeTruthy();
    expect(screen.getByText('You pay this every year. Spending more does not change it.')).toBeTruthy();
    expect(screen.getByText('Prizes for spending')).toBeTruthy();
    expect(screen.getByText('Lounges')).toBeTruthy();
    expect(screen.getByText(/^A lounge is a quiet room/)).toBeTruthy();
    expect(screen.getByText(/^Points are like tickets/)).toBeTruthy();
    expect(screen.getByText('This ends on 31 December 2026.')).toBeTruthy();
    expect(screen.getByText('We are still checking the rules for this.')).toBeTruthy();
    expect(screen.getByText('We could not find gifts for this card yet.')).toBeTruthy();
    expect(screen.queryByText('Gifts for joining and staying')).toBeNull();
  });

  test('says so when the card is no longer in the nest', () => {
    mockParams = { userCardId: 'gone' };
    wrap(<CardLabCardScreen />);
    expect(screen.getByText('We could not find this card')).toBeTruthy();
    fireEvent.press(screen.getByText('See all your cards'));
    expect(mockReplace).toHaveBeenCalledWith('/card-lab');
  });

  test('never calls an unknown price free', () => {
    mockParams = { userCardId: 'u2' };
    wrap(<CardLabCardScreen />);
    expect(screen.getByText('Not known yet')).toBeTruthy();
    expect(screen.queryByText(/free to keep/i)).toBeNull();
  });
});
