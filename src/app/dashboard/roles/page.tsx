'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Shield, Search, Plus, Edit, Trash2, Check, X, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
  { id: 'create_users', label: 'Create Users', category: 'User Management' },
  { id: 'edit_users', label: 'Edit Users', category: 'User Management' },
  { id: 'delete_users', label: 'Delete Users', category: 'User Management' },
  { id: 'assign_roles', label: 'Assign Roles', category: 'User Management' },
  { id: 'create_products', label: 'Create Products', category: 'Inventory' },
  { id: 'edit_products', label: 'Edit Products', category: 'Inventory' },
  { id: 'delete_products', label: 'Delete Products', category: 'Inventory' },
  { id: 'manage_inventory', label: 'Manage Inventory', category: 'Inventory' },
  { id: 'manage_suppliers', label: 'Manage Suppliers', category: 'Inventory' },
  { id: 'manage_customers', label: 'Manage Customers', category: 'Customer Management' },
  { id: 'view_reports', label: 'View Reports', category: 'Reports' },
  { id: 'manage_settings', label: 'Manage Settings', category: 'Settings' },
  { id: 'backup_restore', label: 'Backup & Restore', category: 'Settings' },
  { id: 'view_activity_logs', label: 'View Activity Logs', category: 'Settings' },
  { id: 'approve_stock_adjustments', label: 'Approve Stock Adjustments', category: 'Inventory' },
  { id: 'manage_promotions', label: 'Manage Promotions', category: 'Marketing' },
  { id: 'create_sales', label: 'Create Sales', category: 'Sales' },
  { id: 'process_payments', label: 'Process Payments', category: 'Sales' },
  { id: 'view_products', label: 'View Products', category: 'Inventory' },
  { id: 'process_returns', label: 'Process Returns', category: 'Sales' },
  { id: 'view_own_sales', label: 'View Own Sales', category: 'Sales' },
];

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/roles' + (searchQuery ? `?search=${searchQuery}` : ''));
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [searchQuery]);

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    setShowDialog(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    setShowDialog(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Role deleted successfully');
        fetchRoles();
      } else {
        toast.error(data.error || 'Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingRole ? `/api/roles/${editingRole._id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setShowDialog(false);
        fetchRoles();
      } else {
        toast.error(data.error || 'Failed to save role');
      }
    } catch (error) {
      toast.error('Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Roles & Permissions" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search roles"
            />
          </div>
          <Button 
            className="bg-primary text-primary-foreground ml-4"
            onClick={handleAddRole}
            aria-label="Add new role"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Role
          </Button>
        </div>

        <ErrorBoundary>
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Loading roles">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roles?.map((role: any, index: number) => {
                const permissions = role.permissions ?? [];

                return (
                  <motion.div
                    key={role._id || role.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                              <span className="font-bold text-foreground">
                                {role.name}
                              </span>

                              {role.isSystem && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-bold">
                                  SYSTEM
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {role.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span className="text-sm text-muted-foreground">
                            {role.userCount ?? 0} users assigned
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                            Permissions ({permissions.length})
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {permissions.slice(0, 6).map((permission: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-secondary text-foreground rounded text-xs"
                              >
                                {AVAILABLE_PERMISSIONS.find(p => p.id === permission)?.label || permission}
                              </span>
                            ))}

                            {permissions.length > 6 && (
                              <span className="px-2 py-1 bg-secondary text-muted-foreground rounded text-xs">
                                +{permissions.length - 6} more
                              </span>
                            )}

                            {permissions.length === 0 && (
                              <span className="text-xs text-muted-foreground italic">
                                No permissions assigned
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditRole(role)}
                            aria-label={`Edit ${role.name}`}
                          >
                            <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                            Edit
                          </Button>

                          {!role.isSystem && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteRole(role._id || role.id)}
                              aria-label={`Delete ${role.name}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && (!roles || roles.length === 0) && (
            <div className="text-center py-12" role="status" aria-live="polite">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No roles found matching your search' : 'No roles found. Create your first role.'}
              </p>
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Add/Edit Role Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Supervisor"
                disabled={editingRole?.isSystem}
                aria-label="Role name"
              />
            </div>
            
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role's purpose..."
                rows={3}
                aria-label="Role description"
              />
            </div>

            <div>
              <Label>Permissions ({formData.permissions.length} selected)</Label>
              <div className="mt-2 space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <button
                          key={permission.id}
                          type="button"
                          onClick={() => handleTogglePermission(permission.id)}
                          disabled={editingRole?.isSystem}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                            formData.permissions.includes(permission.id)
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-card border-border hover:bg-secondary/50'
                          } ${editingRole?.isSystem ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label={`Toggle ${permission.label} permission`}
                          aria-pressed={formData.permissions.includes(permission.id)}
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">{permission.label}</span>
                          </div>
                          {formData.permissions.includes(permission.id) && (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || editingRole?.isSystem}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}