import { POST } from '@/app/api/settings/route';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('settings API authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects non-admin users with a forbidden response', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'manager@example.com',
        role: 'manager',
        branchId: 'branch-1',
      },
    });

    const request = new Request('http://localhost/api/settings', {
      method: 'POST',
      body: JSON.stringify({ settings: { storeName: 'Test Store' } }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Admin access required',
      })
    );
  });
});
