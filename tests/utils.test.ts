import { describe, it, expect } from 'vitest';
import { formatSecondsToTime, generateId, getTodayDateString, formatDisplayDate } from '../src/renderer/lib/utils';

describe('Utility Functions & Formatters', () => {
  it('formats seconds into MM:SS format with tabular accuracy', () => {
    expect(formatSecondsToTime(0)).toBe('00:00');
    expect(formatSecondsToTime(65)).toBe('01:05');
    expect(formatSecondsToTime(1500)).toBe('25:00');
    expect(formatSecondsToTime(3000)).toBe('50:00');
    expect(formatSecondsToTime(5400)).toBe('90:00');
  });

  it('generates unique prefixed IDs', () => {
    const id1 = generateId('task');
    const id2 = generateId('task');
    expect(id1.startsWith('task_')).toBe(true);
    expect(id1).not.toBe(id2);
  });

  it('generates valid today date string YYYY-MM-DD', () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('computes display date with weekday and week number', () => {
    const { weekday, monthDay, weekNumber } = formatDisplayDate(new Date('2026-09-26T12:00:00Z'));
    expect(weekday).toBeDefined();
    expect(monthDay).toBeDefined();
    expect(weekNumber).toBeGreaterThan(0);
  });
});
