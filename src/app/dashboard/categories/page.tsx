'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Layers, Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCategories, useDeleteCategory, type Category } from '@/hooks/useCategories';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CategoryForm } from '@/components/dialogs/CategoryForm';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { data: categories, isLoading, error, refetch } = useCategories({ search: searchQuery });
  const deleteCategory = useDeleteCategory();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate(id);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const categoryIcons: Record<string, string> = {
    'Beverages': '🥤',
    'Food': '🍝',
    'Bakery': '🥖',
    'Dairy': '🥛',
    'Snacks': '🍪',
    'Household': '🧹',
    'default': '📦'
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Product Categories" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button 
            className="bg-primary text-primary-foreground ml-4"
            onClick={handleAddCategory}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <ErrorBoundary>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">Failed to load categories</p>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category: any, index: number) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                        {categoryIcons[category.name] || categoryIcons.default}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{category.productCount} products</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(category._id)}
                      disabled={deleteCategory.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        )}

        {!isLoading && !error && (!categories || categories.length === 0) && (
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No categories found matching your search</p>
          </div>
        )}
        </ErrorBoundary>

        <CategoryForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          mode={formMode}
          category={selectedCategory}
          onSuccess={() => refetch()}
        />
      </main>
    </div>
  );
}
