/* global test, expect */
import { clamp, nudge, ratioOf, valueAt } from './sliderMath';

test('clamp keeps a value inside its range', () => {
  expect(clamp(5, 0, 10)).toBe(5);
  expect(clamp(-3, 0, 10)).toBe(0);
  expect(clamp(99, 0, 10)).toBe(10);
});

test('ratioOf places a value in the range, and survives a degenerate range', () => {
  expect(ratioOf(0, 0, 100)).toBe(0);
  expect(ratioOf(50, 0, 100)).toBe(0.5);
  expect(ratioOf(100, 0, 100)).toBe(1);
  expect(ratioOf(500, 0, 100)).toBe(1);
  expect(ratioOf(5, 10, 10)).toBe(0);
});

test('valueAt snaps to the step and stays in range', () => {
  expect(valueAt(0, 0, 60000, 500)).toBe(0);
  expect(valueAt(1, 0, 60000, 500)).toBe(60000);
  expect(valueAt(0.5, 0, 60000, 500)).toBe(30000);
  // 0.4013 of 60,000 is 24,078: snaps to the nearest ₹500.
  expect(valueAt(0.4013, 0, 60000, 500)).toBe(24000);
  expect(valueAt(2, 0, 60000, 500)).toBe(60000);
  expect(valueAt(-1, 0, 60000, 500)).toBe(0);
});

test('every value valueAt returns is a multiple of the step', () => {
  for (let i = 0; i <= 200; i += 1) {
    expect(valueAt(i / 200, 0, 150000, 1000) % 1000).toBe(0);
  }
});

test('nudge moves one step and stops at the ends', () => {
  expect(nudge(1000, 1, 0, 5000, 500)).toBe(1500);
  expect(nudge(1000, -1, 0, 5000, 500)).toBe(500);
  expect(nudge(0, -1, 0, 5000, 500)).toBe(0);
  expect(nudge(5000, 1, 0, 5000, 500)).toBe(5000);
});
