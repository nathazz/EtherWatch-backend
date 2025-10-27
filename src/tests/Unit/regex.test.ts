
import { ethers } from 'ethers';
import { isValidBlock, isValidHash } from '../../utils/regex';

describe('validation utilities (Regex)', () => {
  describe('isValidHash', () => {
    test('returns true for a valid 32-byte hex string', () => {
      const validHash = ethers.hexlify(ethers.randomBytes(32)); 
      expect(isValidHash(validHash)).toBe(true);
    });

    test('returns false for an invalid hash (wrong length)', () => {
      const shortHash = '0x1234';
      expect(isValidHash(shortHash)).toBe(false);
    });

    test('returns false for a non-hex string', () => {
      const invalid = 'not-a-hex';
      expect(isValidHash(invalid)).toBe(false);
    });
  });

  describe('isValidBlock', () => {
    test('returns true for a valid block number (integer)', () => {
      expect(isValidBlock(123456)).toBe(true);
    });

    test('returns true for a numeric string', () => {
      expect(isValidBlock('789')).toBe(true);
    });

    test('returns true for a valid block hash', () => {
      const blockHash = '0x' + 'a'.repeat(64);
      expect(isValidBlock(blockHash)).toBe(true);
    });

    test('returns false for an invalid hash (wrong length)', () => {
      const badHash = '0x' + 'a'.repeat(10);
      expect(isValidBlock(badHash)).toBe(false);
    });

    test('returns false for a non-numeric, non-hash string', () => {
      expect(isValidBlock('hello')).toBe(false);
    });
  });
});
