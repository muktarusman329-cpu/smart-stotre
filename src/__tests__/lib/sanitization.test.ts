import {
  sanitizeString,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeObjectId,
  sanitizePhone,
  sanitizeNumber,
  sanitizeObject,
  validateRole,
  validateCategory,
} from '@/lib/sanitization';

describe('sanitizeString', () => {
  it('removes MongoDB operator characters', () => {
    expect(sanitizeString('test{$gt: 1}')).toBe('testgt: 1');
  });

  it('removes control characters', () => {
    expect(sanitizeString('hello\x00world')).toBe('helloworld');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123 as unknown as string)).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
  });
});

describe('sanitizeEmail', () => {
  it('returns lowercase valid email', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
  });

  it('returns empty for invalid email', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
  });

  it('strips MongoDB operators from email', () => {
    expect(sanitizeEmail('user{$ne: null}@test.com')).toBe('');
  });

  it('returns empty for non-string input', () => {
    expect(sanitizeEmail(42 as unknown as string)).toBe('');
  });

  it('trims whitespace before validation', () => {
    expect(sanitizeEmail('  user@test.com  ')).toBe('user@test.com');
  });

  it('rejects email with spaces in the middle', () => {
    expect(sanitizeEmail('user @test.com')).toBe('');
  });
});

describe('sanitizeSearchQuery', () => {
  it('passes through characters not special in regex', () => {
    expect(sanitizeSearchQuery('price >= 100')).toBe('price >= 100');
  });

  it('escapes dots and question marks', () => {
    expect(sanitizeSearchQuery('file.txt?')).toBe('file\\.txt\\?');
  });

  it('escapes and strips MongoDB operators', () => {
    const result = sanitizeSearchQuery('{$gt: 100}');
    expect(result).not.toContain('{');
    expect(result).not.toContain('}');
    expect(result).not.toContain('$');
    expect(result).toContain('gt: 100');
  });

  it('returns empty for non-string input', () => {
    expect(sanitizeSearchQuery(null as unknown as string)).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizeSearchQuery('  test  ')).toBe('test');
  });
});

describe('sanitizeObjectId', () => {
  it('returns valid 24-hex-char ObjectId', () => {
    expect(sanitizeObjectId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
  });

  it('returns null for invalid ObjectId', () => {
    expect(sanitizeObjectId('not-a-valid-id')).toBeNull();
  });

  it('returns null for ObjectId with MongoDB operators', () => {
    expect(sanitizeObjectId('{$ne: null}')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(sanitizeObjectId(123 as unknown as string)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(sanitizeObjectId('')).toBeNull();
  });

  it('accepts uppercase hex characters', () => {
    expect(sanitizeObjectId('507F1F77BCF86CD799439011')).toBe('507F1F77BCF86CD799439011');
  });
});

describe('sanitizePhone', () => {
  it('keeps digits and common phone characters', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
  });

  it('removes letters and special characters', () => {
    expect(sanitizePhone('abc123def')).toBe('123');
  });

  it('removes MongoDB operators', () => {
    expect(sanitizePhone('{$ne: null}')).toBe('');
  });

  it('returns empty for non-string input', () => {
    expect(sanitizePhone(42 as unknown as string)).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizePhone('  123  ')).toBe('123');
  });
});

describe('sanitizeNumber', () => {
  it('converts valid string to number', () => {
    expect(sanitizeNumber('42')).toBe(42);
  });

  it('returns null for non-numeric input', () => {
    expect(sanitizeNumber('abc')).toBeNull();
  });

  it('returns null when below min', () => {
    expect(sanitizeNumber(5, 10)).toBeNull();
  });

  it('returns null when above max', () => {
    expect(sanitizeNumber(100, 0, 50)).toBeNull();
  });

  it('returns value within range', () => {
    expect(sanitizeNumber(25, 0, 50)).toBe(25);
  });

  it('handles zero correctly', () => {
    expect(sanitizeNumber(0, 0, 100)).toBe(0);
  });

  it('handles NaN input', () => {
    expect(sanitizeNumber(NaN)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(sanitizeNumber(undefined)).toBeNull();
  });
});

describe('sanitizeObject', () => {
  it('sanitizes all string values in a flat object', () => {
    const input = { name: 'test{$gt}', age: 25 };
    const result = sanitizeObject(input);
    expect(result.name).toBe('testgt');
    expect(result.age).toBe(25);
  });

  it('sanitizes nested objects', () => {
    const input = { user: { name: 'evil{$ne}' } };
    const result = sanitizeObject(input);
    expect(result.user.name).toBe('evilne');
  });

  it('sanitizes arrays', () => {
    const input = ['test{$in}', 'normal'];
    const result = sanitizeObject(input);
    expect(result).toEqual(['testin', 'normal']);
  });

  it('returns null for null input', () => {
    expect(sanitizeObject(null)).toBeNull();
  });

  it('returns undefined for undefined input', () => {
    expect(sanitizeObject(undefined)).toBeUndefined();
  });

  it('returns numbers unchanged', () => {
    expect(sanitizeObject(42)).toBe(42);
  });
});

describe('validateRole', () => {
  it('returns true for admin', () => {
    expect(validateRole('admin')).toBe(true);
  });

  it('returns true for manager', () => {
    expect(validateRole('manager')).toBe(true);
  });

  it('returns true for cashier', () => {
    expect(validateRole('cashier')).toBe(true);
  });

  it('returns false for invalid role', () => {
    expect(validateRole('superuser')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateRole('')).toBe(false);
  });
});

describe('validateCategory', () => {
  it('returns true for stock', () => {
    expect(validateCategory('stock')).toBe(true);
  });

  it('returns true for expiry', () => {
    expect(validateCategory('expiry')).toBe(true);
  });

  it('returns true for payment', () => {
    expect(validateCategory('payment')).toBe(true);
  });

  it('returns true for system', () => {
    expect(validateCategory('system')).toBe(true);
  });

  it('returns true for ai_insight', () => {
    expect(validateCategory('ai_insight')).toBe(true);
  });

  it('returns false for invalid category', () => {
    expect(validateCategory('other')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateCategory('')).toBe(false);
  });
});
