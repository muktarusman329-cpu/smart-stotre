import { generateThankYouMessage } from '@/lib/whatsapp-utils';

describe('generateThankYouMessage', () => {
  it('includes the customer name', () => {
    const msg = generateThankYouMessage('John', 100);
    expect(msg).toContain('Hello John');
  });

  it('includes the formatted amount with two decimal places', () => {
    const msg = generateThankYouMessage('Jane', 1500.5);
    expect(msg).toContain('1500.50');
  });

  it('includes the thank you text', () => {
    const msg = generateThankYouMessage('Ali', 200);
    expect(msg).toContain('Thank you for shopping');
  });

  it('includes Smart Store branding', () => {
    const msg = generateThankYouMessage('Ali', 200);
    expect(msg).toContain('Smart Store');
  });

  it('formats zero amount correctly', () => {
    const msg = generateThankYouMessage('Test', 0);
    expect(msg).toContain('0.00');
  });

  it('handles long customer names', () => {
    const name = 'A'.repeat(100);
    const msg = generateThankYouMessage(name, 50);
    expect(msg).toContain(`Hello ${name}`);
  });
});
