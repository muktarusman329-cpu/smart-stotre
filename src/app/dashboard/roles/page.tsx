'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Shield, Search, Plus, Edit, Trash2, Check, X, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for roles and permissions
  const roles = [
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access with all permissions',
      userCount: 2,
      permissions: [
        'create_users', 'edit_users', 'delete_users', 'assign_roles',
        'create_products', 'edit_products', 'delete_products', 'manage_inventory',
        'manage_suppliers', 'manage_customers', 'view_reports', 'manage_settings',
        'backup_restore', 'view_activity_logs'
      ],
      isSystem: true
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Operations management with limited system access',
      userCount: 5,
      permissions: [
        'create_products', 'edit_products', 'manage_inventory',
        'manage_suppliers', 'manage_customers', 'view_reports',
        'approve_stock_adjustments', 'manage_promotions'
      ],
      isSystem: true
    },
    {
      id: '3',
      name: 'Cashier',
      description: 'Point of sale operations only',
      userCount: 15,
      permissions: [
        'create_sales', 'process_payments', 'view_products',
        'process_returns', 'view_own_sales'
      ],
      isSystem: true
    }
  ];

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissionLabels: Record<string, string> = {
    create_users: 'Create Users',
    edit_users: 'Edit Users',
    delete_users: 'Delete Users',
    assign_roles: 'Assign Roles',
    create_products: 'Create Products',
    edit_products: 'Edit Products',
    delete_products: 'Delete Products',
    manage_inventory: 'Manage Inventory',
    manage_suppliers: 'Manage Suppliers',
    manage_customers: 'Manage Customers',
    view_reports: 'View Reports',
    manage_settings: 'Manage Settings',
    backup_restore: 'Backup & Restore',
    view_activity_logs: 'View Activity Logs',
    approve_stock_adjustments: 'Approve Stock Adjustments',
    manage_promotions: 'Manage Promotions',
    create_sales: 'Create Sales',
    process_payments: 'Process Payments',
    view_products: 'View Products',
    process_returns: 'Process Returns',
    view_own_sales: 'View Own Sales'
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Roles & Permissions" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button className="bg-primary text-primary-foreground ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground">{role.name}</span>
                        {role.isSystem && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-bold">
                            SYSTEM
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{role.userCount} users assigned</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Permissions ({role.permissions.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 6).map((permission, idx) => (
                        <span key={idx} className="px-2 py-1 bg-secondary text-foreground rounded text-xs">
                          {permissionLabels[permission] || permission}
                        </span>
                      ))}
                      {role.permissions.length > 6 && (
                        <span className="px-2 py-1 bg-secondary text-muted-foreground rounded text-xs">
                          +{role.permissions.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Permissions
                    </Button>
                    {!role.isSystem && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No roles found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
