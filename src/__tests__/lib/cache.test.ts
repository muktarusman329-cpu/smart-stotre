import fs from 'fs';
import { get, set, invalidate, invalidatePattern, clear, getCacheStats } from '@/lib/cache';

jest.mock('fs');

const mockedFs = jest.mocked(fs);

describe('cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(false);
  });

  describe('set and get', () => {
    it('stores a value and retrieves it', () => {
      let stored: string | undefined;
      mockedFs.writeFileSync.mockImplementation((_path, data) => {
        stored = data as string;
      });
      mockedFs.existsSync.mockReturnValue(false);

      set('testKey', { foo: 'bar' }, 60000);

      expect(mockedFs.writeFileSync).toHaveBeenCalled();
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed['testKey']).toBeDefined();
      expect(parsed['testKey'].value).toEqual({ foo: 'bar' });
      expect(parsed['testKey'].expiry).toBeGreaterThan(Date.now());
    });

    it('returns null for missing key', () => {
      mockedFs.existsSync.mockReturnValue(false);
      const result = get('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null for expired entry', () => {
      const expiredData = JSON.stringify({
        testKey: { value: 'old', expiry: Date.now() - 1000 },
      });
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(expiredData);

      const result = get('testKey');
      expect(result).toBeNull();
    });

    it('returns value for valid (non-expired) entry', () => {
      const validData = JSON.stringify({
        testKey: { value: 'fresh', expiry: Date.now() + 60000 },
      });
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(validData);

      const result = get<string>('testKey');
      expect(result).toBe('fresh');
    });
  });

  describe('invalidate', () => {
    it('removes a specific key', () => {
      let stored: string | undefined;
      const data = {
        key1: { value: 'a', expiry: Date.now() + 60000 },
        key2: { value: 'b', expiry: Date.now() + 60000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));
      mockedFs.writeFileSync.mockImplementation((_path, d) => {
        stored = d as string;
      });

      invalidate('key1');

      const parsed = JSON.parse(stored!);
      expect(parsed['key1']).toBeUndefined();
      expect(parsed['key2']).toBeDefined();
    });
  });

  describe('invalidatePattern', () => {
    it('removes keys matching a regex pattern', () => {
      let stored: string | undefined;
      const data = {
        'user:1': { value: 'a', expiry: Date.now() + 60000 },
        'user:2': { value: 'b', expiry: Date.now() + 60000 },
        'product:1': { value: 'c', expiry: Date.now() + 60000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));
      mockedFs.writeFileSync.mockImplementation((_path, d) => {
        stored = d as string;
      });

      invalidatePattern('^user:');

      const parsed = JSON.parse(stored!);
      expect(parsed['user:1']).toBeUndefined();
      expect(parsed['user:2']).toBeUndefined();
      expect(parsed['product:1']).toBeDefined();
    });
  });

  describe('clear', () => {
    it('deletes the cache file when it exists', () => {
      mockedFs.existsSync.mockReturnValue(true);
      clear();
      expect(mockedFs.unlinkSync).toHaveBeenCalled();
    });

    it('does nothing when cache file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      clear();
      expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('returns count and size of non-expired entries', () => {
      const data = {
        key1: { value: 'a', expiry: Date.now() + 60000 },
        key2: { value: 'b', expiry: Date.now() - 1000 }, // expired
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));

      const stats = getCacheStats();
      expect(stats.keys).toBe(1);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('returns zero keys for empty cache', () => {
      mockedFs.existsSync.mockReturnValue(false);
      const stats = getCacheStats();
      expect(stats.keys).toBe(0);
    });
  });
});
