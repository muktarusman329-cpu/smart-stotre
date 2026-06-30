import { formatCurrency, formatDate, generateSKU, generateBarcode, generateCustomerId, generateTransactionId } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats a positive number as NGN currency', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
    expect(result).toContain('₦');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0.00');
  });

  it('formats decimal values with two fraction digits', () => {
    const result = formatCurrency(99.9);
    expect(result).toContain('99.90');
  });

  it('formats large numbers with thousands separators', () => {
    const result = formatCurrency(1234567.89);
    expect(result).toContain('1,234,567.89');
  });

  it('formats negative numbers', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500');
  });
});

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-03-15'));
    expect(result).toBe('Mar 15, 2024');
  });

  it('formats a date string', () => {
    const result = formatDate('2024-12-25');
    expect(result).toBe('Dec 25, 2024');
  });

  it('formats another date to verify month abbreviation', () => {
    const result = formatDate('2023-01-01');
    expect(result).toBe('Jan 1, 2023');
  });
});

describe('generateSKU', () => {
  it('returns a string starting with SKU-', () => {
    const sku = generateSKU();
    expect(sku).toMatch(/^SKU-/);
  });

  it('contains uppercase alphanumeric characters after prefix', () => {
    const sku = generateSKU();
    expect(sku).toMatch(/^SKU-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('generates unique values on successive calls', () => {
    const sku1 = generateSKU();
    const sku2 = generateSKU();
    expect(sku1).not.toBe(sku2);
  });
});

describe('generateBarcode', () => {
  it('returns a non-empty string', () => {
    const barcode = generateBarcode();
    expect(barcode.length).toBeGreaterThan(0);
  });

  it('contains digits from the timestamp portion', () => {
    const barcode = generateBarcode();
    expect(barcode).toMatch(/^\d+/);
  });

  it('generates unique values', () => {
    const b1 = generateBarcode();
    const b2 = generateBarcode();
    expect(b1).not.toBe(b2);
  });
});

describe('generateCustomerId', () => {
  it('returns a string starting with CUST-', () => {
    const id = generateCustomerId();
    expect(id).toMatch(/^CUST-/);
  });

  it('matches the expected pattern', () => {
    const id = generateCustomerId();
    expect(id).toMatch(/^CUST-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('generates unique values', () => {
    const id1 = generateCustomerId();
    const id2 = generateCustomerId();
    expect(id1).not.toBe(id2);
  });
});

describe('generateTransactionId', () => {
  it('returns a string starting with TXN-', () => {
    const id = generateTransactionId();
    expect(id).toMatch(/^TXN-/);
  });

  it('matches the expected pattern', () => {
    const id = generateTransactionId();
    expect(id).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('generates unique values', () => {
    const id1 = generateTransactionId();
    const id2 = generateTransactionId();
    expect(id1).not.toBe(id2);
  });
});
