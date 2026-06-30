import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.cache-data.json');
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

interface CacheEntry {
  value: any;
  expiry: number;
}

interface CacheData {
  [key: string]: CacheEntry;
}

function readCache(): CacheData {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return {};
}

function writeCache(data: CacheData) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

function cleanupExpiredCache(data: CacheData): CacheData {
  const now = Date.now();
  const cleaned: CacheData = {};
  
  for (const [key, entry] of Object.entries(data)) {
    if (now < entry.expiry) {
      cleaned[key] = entry;
    }
  }
  
  return cleaned;
}

export function get<T>(key: string): T | null {
  const data = cleanupExpiredCache(readCache());
  const entry = data[key];
  const now = Date.now();
  
  if (entry && now < entry.expiry) {
    return entry.value as T;
  }
  
  return null;
}

export function set(key: string, value: any, ttl: number = DEFAULT_TTL): void {
  const data = cleanupExpiredCache(readCache());
  const now = Date.now();
  
  data[key] = {
    value,
    expiry: now + ttl
  };
  
  writeCache(data);
}

export function invalidate(key: string): void {
  const data = readCache();
  delete data[key];
  writeCache(data);
}

export function invalidatePattern(pattern: string): void {
  const data = readCache();
  const regex = new RegExp(pattern);
  
  for (const key of Object.keys(data)) {
    if (regex.test(key)) {
      delete data[key];
    }
  }
  
  writeCache(data);
}

export function clear(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export function getCacheStats(): { keys: number; size: number } {
  const data = cleanupExpiredCache(readCache());
  const size = JSON.stringify(data).length;
  
  return {
    keys: Object.keys(data).length,
    size
  };
}
