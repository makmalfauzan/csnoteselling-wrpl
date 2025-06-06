import { capitalizeFirstLetter } from '../../src/utils/formatters'; // Sesuaikan path

describe('Formatter Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    test('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    test('should return an empty string if input is empty', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    test('should handle already capitalized string', () => {
      expect(capitalizeFirstLetter('World')).toBe('World');
    });
  });
});
