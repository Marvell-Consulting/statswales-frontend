import { dateFormat } from '../../src/shared/utils/date-format';

describe('dateFormat', () => {
  describe('valid inputs', () => {
    it('formats an ISO date string', () => {
      expect(dateFormat('2024-03-15T00:00:00Z', 'd MMMM yyyy', { utc: true })).toBe('15 March 2024');
    });

    it('formats a Date object', () => {
      expect(dateFormat(new Date('2024-03-15T00:00:00Z'), 'd MMMM yyyy', { utc: true })).toBe('15 March 2024');
    });

    it('formats a numeric timestamp', () => {
      expect(dateFormat(Date.UTC(2024, 2, 15), 'd MMMM yyyy', { utc: true })).toBe('15 March 2024');
    });

    it('applies the Welsh locale when `cy` is passed', () => {
      expect(dateFormat('2024-03-15T00:00:00Z', 'MMMM', { utc: true, locale: 'cy-GB' })).toBe('Mawrth');
    });
  });

  describe('nullish / empty inputs', () => {
    it('returns an empty string for null', () => {
      expect(dateFormat(null, 'd MMMM yyyy')).toBe('');
    });

    it('returns an empty string for undefined', () => {
      expect(dateFormat(undefined, 'd MMMM yyyy')).toBe('');
    });

    it('returns an empty string for an empty string', () => {
      expect(dateFormat('', 'd MMMM yyyy')).toBe('');
    });
  });

  describe('invalid inputs', () => {
    it('returns the raw string for an unparseable date string', () => {
      expect(dateFormat('30/09/2025', 'd MMMM yyyy')).toBe('30/09/2025');
    });

    it('returns the raw string for a nonsense date string', () => {
      expect(dateFormat('not a date', 'd MMMM yyyy')).toBe('not a date');
    });

    it('returns an empty string for an Invalid Date object', () => {
      expect(dateFormat(new Date('not a date'), 'd MMMM yyyy')).toBe('');
    });

    it('returns an empty string for NaN', () => {
      expect(dateFormat(NaN, 'd MMMM yyyy')).toBe('');
    });
  });
});
