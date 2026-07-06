import { getDashboardRoleConfig } from '@/lib/dashboard-role';

describe('dashboard role config', () => {
  it('returns a cashier-friendly dashboard config', () => {
    const config = getDashboardRoleConfig('cashier');

    expect(config.title).toBe('POS Dashboard');
    expect(config.roleLabel).toBe('Cashier');
    expect(config.quickActions).toEqual(['new-sale', 'print-receipt']);
    expect(config.canViewInventory).toBe(true);
    expect(config.canManageInventory).toBe(false);
    expect(config.canManageEmployees).toBe(false);
    expect(config.canAccessSettings).toBe(false);
  });

  it('returns a manager dashboard config with broader access', () => {
    const config = getDashboardRoleConfig('manager');

    expect(config.title).toBe('Operations Dashboard');
    expect(config.roleLabel).toBe('Manager');
    expect(config.quickActions).toEqual(expect.arrayContaining(['new-sale', 'add-product', 'generate-report']));
    expect(config.canViewInventory).toBe(true);
    expect(config.canManageInventory).toBe(true);
    expect(config.canManageEmployees).toBe(false);
    expect(config.canAccessSettings).toBe(false);
  });

  it('returns an admin dashboard config with full access', () => {
    const config = getDashboardRoleConfig('admin');

    expect(config.title).toBe('Executive Overview');
    expect(config.roleLabel).toBe('Admin');
    expect(config.quickActions).toEqual(expect.arrayContaining(['new-sale', 'add-product', 'receive-stock', 'generate-report', 'record-expense']));
    expect(config.canViewInventory).toBe(true);
    expect(config.canManageInventory).toBe(true);
    expect(config.canManageEmployees).toBe(true);
    expect(config.canAccessSettings).toBe(true);
  });
});
