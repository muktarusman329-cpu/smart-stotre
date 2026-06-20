export function generateThankYouMessage(
  customerName: string,
  amount: number
): string {
  return `Hello ${customerName},
Thank you for shopping with Smart Store 🛒.
Your purchase total was ${amount.toFixed(2)}.
We appreciate your business and hope to see you again.`;
}
