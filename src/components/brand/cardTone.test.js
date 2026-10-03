/* global test, expect */
import { cardHeight, monogramFor, TONE_ORDER, toneForBank } from './cardTone';

test('known banks keep a stable, explicit tone', () => {
  expect(toneForBank('HDFC')).toBe('blue');
  expect(toneForBank('ICICI')).toBe('coral');
  expect(toneForBank('AMEX')).toBe('graphite');
});

test('unknown banks hash onto the palette deterministically', () => {
  const first = toneForBank('Some New Bank');
  expect(TONE_ORDER).toContain(first);
  expect(toneForBank('Some New Bank')).toBe(first);
});

test('a missing bank still gets a valid tone and monogram', () => {
  expect(TONE_ORDER).toContain(toneForBank());
  expect(monogramFor()).toBe('CB');
});

test('monogram is the first two letters, uppercased, ignoring punctuation', () => {
  expect(monogramFor('Axis Bank')).toBe('AX');
  expect(monogramFor('  hsbc')).toBe('HS');
  expect(monogramFor('1. Yes Bank')).toBe('YE');
});

test('card art height follows the fixed aspect ratio', () => {
  expect(cardHeight(300)).toBe(189);
  expect(cardHeight(76)).toBe(48);
});
