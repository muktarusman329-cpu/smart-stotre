import fs from 'fs';
import { checkRateLimit, resetRateLimit, getRateLimitStatus } from '@/lib/auth-rate-limit';

jest.mock('fs');

const mockedFs = jest.mocked(fs);

describe('auth-rate-limit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(false);
  });

  describe('checkRateLimit', () => {
    it('allows the first request for an email', () => {
      mockedFs.writeFileSync.mockImplementation(() => {});

      const result = checkRateLimit('user@test.com', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('blocks when max attempts exceeded', () => {
      const data = {
        'user@test.com': { count: 5, resetTime: Date.now() + 60000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));
      mockedFs.writeFileSync.mockImplementation(() => {});

      const result = checkRateLimit('user@test.com', 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows request when window has expired', () => {
      const data = {
        'user@test.com': { count: 5, resetTime: Date.now() - 1000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));
      mockedFs.writeFileSync.mockImplementation(() => {});

      const result = checkRateLimit('user@test.com', 5, 60000);
      expect(result.allowed).toBe(true);
    });

    it('increments count for existing non-expired record below limit', () => {
      let stored: string | undefined;
      const data = {
        'user@test.com': { count: 2, resetTime: Date.now() + 60000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));
      mockedFs.writeFileSync.mockImplementation((_path, d) => {
        stored = d as string;
      });

      const result = checkRateLimit('user@test.com', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 3

      const parsed = JSON.parse(stored!);
      expect(parsed['user@test.com'].count).toBe(3);
    });

    it('uses default max attempts of 5', () => {
      mockedFs.writeFileSync.mockImplementation(() => {});

      const result = checkRateLimit('user@test.com');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('resetRateLimit', () => {
    it('removes the rate limit entry for an email', () => {
      let stored: string | undefined;
      const data = {
        'user@test.com': { count: 3, resetTime: Date.now() + 60000 },
        'other@test.com': { count: 1, resetTime: Date.now() + 60000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));
      mockedFs.writeFileSync.mockImplementation((_path, d) => {
        stored = d as string;
      });

      resetRateLimit('user@test.com');

      const parsed = JSON.parse(stored!);
      expect(parsed['user@test.com']).toBeUndefined();
      expect(parsed['other@test.com']).toBeDefined();
    });
  });

  describe('getRateLimitStatus', () => {
    it('returns status for active rate limit', () => {
      const resetTime = Date.now() + 60000;
      const data = {
        'user@test.com': { count: 3, resetTime },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));

      const status = getRateLimitStatus('user@test.com');
      expect(status).not.toBeNull();
      expect(status!.count).toBe(3);
      expect(status!.resetTime).toBe(resetTime);
    });

    it('returns null for expired entry', () => {
      const data = {
        'user@test.com': { count: 3, resetTime: Date.now() - 1000 },
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(data));

      const status = getRateLimitStatus('user@test.com');
      expect(status).toBeNull();
    });

    it('returns null for unknown email', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const status = getRateLimitStatus('unknown@test.com');
      expect(status).toBeNull();
    });
  });
});
