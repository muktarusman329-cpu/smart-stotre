import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const RATE_LIMIT_FILE = path.join(process.cwd(), '.api-rate-limit.json');

interface RateLimitStore {
  count: number;
  resetTime: number;
}

interface RateLimitData {
  [identifier: string]: RateLimitStore;
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
  
  for (const [identifier, record] of Object.entries(data)) {
    if (now < record.resetTime) {
      cleaned[identifier] = record;
    }
  }
  
  return cleaned;
}

export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; remaining: number; resetTime: number } {
  if (!identifier || identifier.trim() === '') {
    return { success: true, remaining: limit, resetTime: Date.now() + windowMs };
  }
  const data = cleanupExpiredEntries(readRateLimitData());
  const now = Date.now();
  const record = data[identifier];

  if (!record || now >= record.resetTime) {
    // Create new record or reset expired one
    const resetTime = now + windowMs;
    data[identifier] = { count: 1, resetTime };
    writeRateLimitData(data);
    return { success: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  writeRateLimitData(data);
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Combine IP with user agent for better uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent}`;
}

export function resetRateLimit(identifier: string) {
  const data = readRateLimitData();
  delete data[identifier];
  writeRateLimitData(data);
}
