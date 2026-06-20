/**
 * Persistent rate limiting for authentication
 * Uses file-based storage to persist across server restarts in development
 */

import fs from 'fs';
import path from 'path';

const RATE_LIMIT_FILE = path.join(process.cwd(), '.auth-rate-limit.json');

interface RateLimitData {
  [email: string]: {
    count: number;
    resetTime: number;
  };
}

function readRateLimitData(): RateLimitData {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      const data = fs.readFileSync(RATE_LIMIT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading rate limit data:', error);
  }
  return {};
}

function writeRateLimitData(data: RateLimitData) {
  try {
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing rate limit data:', error);
  }
}

function cleanupExpiredEntries(data: RateLimitData): RateLimitData {
  const now = Date.now();
  const cleaned: RateLimitData = {};
  
  for (const [email, record] of Object.entries(data)) {
    if (now < record.resetTime) {
      cleaned[email] = record;
    }
  }
  
  return cleaned;
}

export function checkRateLimit(email: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): { allowed: boolean; remaining: number; resetTime: number } {
  const data = cleanupExpiredEntries(readRateLimitData());
  const now = Date.now();
  const record = data[email];
  
  if (record && now < record.resetTime && record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  if (!record || now >= record.resetTime) {
    data[email] = {
      count: 1,
      resetTime: now + windowMs
    };
  } else {
    data[email].count++;
  }
  
  writeRateLimitData(data);
  
  return {
    allowed: true,
    remaining: maxAttempts - data[email].count,
    resetTime: data[email].resetTime
  };
}

export function resetRateLimit(email: string) {
  const data = readRateLimitData();
  delete data[email];
  writeRateLimitData(data);
}

export function getRateLimitStatus(email: string): { count: number; resetTime: number } | null {
  const data = readRateLimitData();
  const record = data[email];
  const now = Date.now();
  
  if (record && now < record.resetTime) {
    return record;
  }
  
  return null;
}
