/* global jest, test, expect, beforeEach */
// #genai: Renders Card Finder with fixture reports, so a missing theme token or a broken prop fails
// here rather than on a device. Network and navigation are stubbed; the components are real.
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CardFinderScreen } from './CardFinderScreen';

const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockQuery;
let mockForm;
let mockPreview;

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
  useFocusEffect: jest.fn(),
}));
jest.mock('../hooks/useCardFinder', () => ({
  useRecommendations: () => mockQuery,
  useFinderForm: () => mockForm,
  usePreview: () => mockPreview,
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
      <CardFinderScreen />
    </SafeAreaProvider>,
  );
}

const pick = (over = {}) => ({
  cardId: 'hsbc',
  bank: 'HSBC',
  cardName: 'HSBC Live+',
  network: 'Visa',
  style: 'cashback',
  styles: ['cashback'],
  goalMatch: true,
  annualGain: 4301,
  rewardsGain: 17280,
  annualFee: 1179,
  grossFee: 1179,
  feeWaived: false,
  waiver: null,
  annualSpend: 840000,
  joiningFee: null,
  topBuckets: [{ bucketId: 'shopping', label: 'Shopping', share: 0.6 }],
  takesFrom: [{ cardId: 'inf', cardName: 'HDFC Infinia', annualSpend: 840000 }],
  ...over,
});

const report = (over = {}) => ({
  goal: { value: 'Reward Points / Air Miles', style: 'points' },
  basis: { monthlyTotal: 86000, annualTotal: 1032000, payMix: 'balanced' },
  wallet: { annualNet: -4240, cardsCounted: 2, cardsNotCounted: 1 },
  plan: {
    steps: [{ ...pick({ goalMatch: false }), step: 1, walletNetBefore: -4240, walletNetAfter: 61 }],
    annualGain: 4301,
    walletNetAfter: 61,
  },
  bestForGoal: pick({ cardId: 'miles', cardName: 'Miles Card', style: 'points', styles: ['points'], goalMatch: true, annualGain: 2100, takesFrom: [] }),
  options: [
    pick({ goalMatch: false }),
    pick({ cardId: 'miles', cardName: 'Miles Card', style: 'points', goalMatch: true, annualGain: 2100 }),
    pick({ cardId: 'amazon', bank: 'ICICI', cardName: 'Amazon Pay', annualGain: 684, annualFee: 0, grossFee: 0, goalMatch: false }),
  ],
  feeUnknown: [{ cardId: 'pop', bank: 'Yes Bank', cardName: 'POP Club', gainBeforeOwnFee: 32300, annualSpend: 300000, topBuckets: [] }],
  unranked: [{ cardId: 'atlas', bank: 'Axis Bank', cardName: 'Axis Atlas', reason: 'needs_point_value', question: null }],
  candidatesConsidered: 12,
  threshold: 1500,
  source: 'audit',
  countsNest: true,
  assumptions: ['Statements are paid in full and on time.'],
  ...over,
});

const formData = (over = {}) => ({
  buckets: [
    { id: 'groceries', label: 'Groceries', group: 'everyday', hint: 'Supermarkets', category: 'grocery', channel: 'flexible', max: 60000, step: 500 },
    { id: 'dining', label: 'Dining', group: 'everyday', hint: 'Restaurants', category: 'dining', channel: 'flexible', max: 40000, step: 500 },
    { id: 'rent', label: 'Rent', group: 'recurring', hint: 'Home rent', category: 'rent', channel: 'ecom', max: 200000, step: 1000 },
  ],
  payMixes: ['instore', 'balanced', 'online'],
  goals: ['Cashback / Statement Credit', 'Reward Points / Air Miles', 'Brand Vouchers'],
  saved: null,
  goal: null,
  nestCount: 0,
  ...over,
});

const noAudit = () => ({
  isPending: false,
  error: { code: 'AUDIT_INCOMPLETE', message: 'Finish your wallet audit.' },
  data: undefined,
  refetch: jest.fn(),
});

beforeEach(() => {
  mockReplace.mockReset();
  mockPush.mockReset();
  mockQuery = { isPending: false, error: null, data: report(), refetch: jest.fn() };
  mockForm = { isPending: false, error: null, data: formData(), refetch: jest.fn() };
  mockPreview = { isPending: false, error: null, data: undefined, mutate: jest.fn() };
});

test('shows the wallet, the plan and every other section', () => {
  renderScreen();
  expect(screen.getByText('Your next card')).toBeTruthy();
  expect(screen.getByText('−Rs.4,240')).toBeTruthy();
  expect(screen.getByText('HSBC Live+')).toBeTruthy();
  expect(screen.getByText('Best first card')).toBeTruthy();
  expect(screen.getAllByText('+Rs.4,301 a year').length).toBeGreaterThan(0);
  expect(screen.getAllByText('After its Rs.1,179 annual fee').length).toBe(2); // plan pick and goal pick
  expect(screen.getByText(/Rs.11,800 a year more in fees/)).toBeTruthy();
  // The goal pick, then the remaining options without repeating either.
  expect(screen.getByText('Best for points and miles')).toBeTruthy();
  expect(screen.getByText('Miles Card')).toBeTruthy();
  expect(screen.getByText('Amazon Pay')).toBeTruthy();
  expect(screen.getByText('+Rs.684 a year')).toBeTruthy();
  expect(screen.getByText('POP Club')).toBeTruthy();
  expect(screen.getByText(/before its annual fee/)).toBeTruthy();
  expect(screen.getByText('Axis Atlas')).toBeTruthy();
  expect(screen.getByText(/1 of your cards is not counted yet/)).toBeTruthy();
});

test('says plainly when no card clears the bar', () => {
  mockQuery.data = report({ plan: { steps: [], annualGain: 0, walletNetAfter: -4240 }, bestForGoal: null });
  renderScreen();
  expect(screen.getByText(/No card we can price adds Rs.1,500 a year/)).toBeTruthy();
});

test('asks its own questions when there is no audit spend, instead of a dead end', () => {
  mockQuery = noAudit();
  renderScreen();
  expect(screen.getByText('Find your next card')).toBeTruthy();
  expect(screen.getByText('What do you want back?')).toBeTruthy();
  expect(screen.getByText('Groceries')).toBeTruthy();
  // Bills sit behind a link so a first-time user sees the everyday sliders only.
  expect(screen.queryByText('Rent')).toBeNull();
  fireEvent.press(screen.getByText('Add bills, rent and other spend'));
  expect(screen.getByText('Rent')).toBeTruthy();
  // Someone with no cards is not asked whether to count them.
  expect(screen.queryByText('Start from scratch')).toBeNull();
  expect(screen.getByText(/Move at least one slider/)).toBeTruthy();
});

test('submits the answers, starting from the saved spend and goal', () => {
  mockQuery = noAudit();
  mockForm.data = formData({ saved: { monthly: { groceries: 12000 }, payMix: 'online' }, goal: 'Brand Vouchers', nestCount: 2 });
  renderScreen();
  expect(screen.getByText('Rs.12,000 a month in all.')).toBeTruthy();
  fireEvent.press(screen.getByText('Start from scratch'));
  fireEvent.press(screen.getByText('Cashback'));
  fireEvent.press(screen.getByText('Find my card'));
  expect(mockPreview.mutate).toHaveBeenCalledWith(
    { monthly: { groceries: 12000 }, payMix: 'online', goal: 'Cashback / Statement Credit', includeNest: false },
    expect.objectContaining({ onSuccess: expect.any(Function) }),
  );
});

test('shows the answers’ results for a first card, with no wallet figure', () => {
  mockQuery = noAudit();
  mockPreview.data = report({ source: 'answers', countsNest: false, wallet: { annualNet: 0, cardsCounted: 0, cardsNotCounted: 0 } });
  mockPreview.mutate = jest.fn((body, { onSuccess }) => onSuccess());
  renderScreen();
  fireEvent.press(screen.getByText('Groceries'));
  // Move a slider by accessibility action so the button enables, then submit.
  fireEvent(screen.getByLabelText(/Groceries/), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  fireEvent.press(screen.getByText('Find my card'));
  expect(screen.getByText('Your next card')).toBeTruthy();
  expect(screen.getByText('What the card below would earn you')).toBeTruthy();
  expect(screen.queryByText('Your wallet a year, after fees')).toBeNull();
  expect(screen.getByText(/from your answers/)).toBeTruthy();
  fireEvent.press(screen.getByText('Change my answers'));
  expect(screen.getByText('Find your next card')).toBeTruthy();
});

test('offers different answers from the audit results', () => {
  renderScreen();
  fireEvent.press(screen.getByText('Try different answers'));
  expect(screen.getByText('Find your next card')).toBeTruthy();
  fireEvent.press(screen.getByText('Back to the results'));
  expect(screen.getByText('Your next card')).toBeTruthy();
});

test('shows a retry for any other failure', () => {
  const refetch = jest.fn();
  mockQuery = { isPending: false, error: { code: 'RECOMMEND_ERROR', message: 'Could not load.' }, data: undefined, refetch };
  renderScreen();
  fireEvent.press(screen.getByText('Try again'));
  expect(refetch).toHaveBeenCalled();
});

test('opens the notes with the catalog count and the API assumptions', () => {
  renderScreen();
  fireEvent.press(screen.getByText('How this works'));
  expect(screen.getByText(/compares the 12 catalog cards/)).toBeTruthy();
  expect(screen.getByText('Statements are paid in full and on time.')).toBeTruthy();
});
