export type DashboardRole = 'admin' | 'manager' | 'cashier';

export interface DashboardRoleConfig {
  title: string;
  roleLabel: string;
  quickActions: string[];
  showExecutiveHero: boolean;
  showCharts: boolean;
  showInventoryAlerts: boolean;
  showRecentTransactions: boolean;
  canViewInventory: boolean;
  canManageInventory: boolean;
  canManageEmployees: boolean;
  canAccessSettings: boolean;
}

export function getDashboardRoleConfig(role: string | undefined | null): DashboardRoleConfig {
  switch (role) {
    case 'admin':
      return {
        title: 'Executive Overview',
        roleLabel: 'Admin',
        quickActions: ['new-sale', 'add-product', 'receive-stock', 'generate-report', 'record-expense', 'print-receipt'],
        showExecutiveHero: true,
        showCharts: true,
        showInventoryAlerts: true,
        showRecentTransactions: true,
        canViewInventory: true,
        canManageInventory: true,
        canManageEmployees: true,
        canAccessSettings: true,
      };
    case 'manager':
      return {
        title: 'Operations Dashboard',
        roleLabel: 'Manager',
        quickActions: ['new-sale', 'add-product', 'generate-report', 'print-receipt'],
        showExecutiveHero: true,
        showCharts: true,
        showInventoryAlerts: true,
        showRecentTransactions: true,
        canViewInventory: true,
        canManageInventory: true,
        canManageEmployees: false,
        canAccessSettings: false,
      };
    case 'cashier':
    default:
      return {
        title: 'POS Dashboard',
        roleLabel: 'Cashier',
        quickActions: ['new-sale', 'print-receipt'],
        showExecutiveHero: false,
        showCharts: false,
        showInventoryAlerts: false,
        showRecentTransactions: false,
        canViewInventory: true,
        canManageInventory: false,
        canManageEmployees: false,
        canAccessSettings: false,
      };
  }
}
