/* global jest, test, expect, beforeEach */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { TransactionList } from './TransactionList';

jest.mock('@/providers/ThemeProvider', () => ({ useTheme: () => ({ colors: { border: '#ccc', primary: '#070', text: '#111', textMuted: '#555' } }) }));
jest.mock('@/components/primitives/Text', () => { const { Text } = require('react-native'); return { Text }; });
jest.mock('@/components/surfaces/Rule', () => ({ Rule: () => null }));
jest.mock('@/components/actions/SecondaryButton', () => { const { Text, Pressable } = require('react-native'); return { SecondaryButton: ({ label, onPress }) => <Pressable onPress={onPress}><Text>{label}</Text></Pressable> }; });

test('loading skeleton is accessible', () => { render(<TransactionList loading />); expect(screen.getByLabelText('Loading transactions')).toBeTruthy(); });
test('empty state explains disconnected tracking', () => { render(<TransactionList disconnected />); expect(screen.getByText('No transactions yet')).toBeTruthy(); expect(screen.getByText(/Connect email/)).toBeTruthy(); });
test('error exposes working retry', () => { const retry = jest.fn(); render(<TransactionList error onRetry={retry} />); fireEvent.press(screen.getByText('Retry transactions')); expect(retry).toHaveBeenCalledTimes(1); });
test('populated rows show merchant, amount, source and status', () => { render(<TransactionList events={[{ eventId: '1', merchantRaw: 'ZOMATO', amountMinor: 24859, currency: 'INR', direction: 'debit', source: 'android_sms', occurredAt: '2026-09-16T01:00:00Z', transactionStatus: 'pending', processingState: 'needs_review', categoryCode: 'food_delivery' }]} />); expect(screen.getByText('ZOMATO')).toBeTruthy(); expect(screen.getByText('−₹248.59')).toBeTruthy(); expect(screen.getByText(/Bank SMS.*Needs review.*pending/)).toBeTruthy(); });
