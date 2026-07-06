'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Layers, Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for categories
  const categories = [
    {
      id: '1',
      name: 'Beverages',
      description: 'Soft drinks, juices, water',
      productCount: 45,
      icon: '🥤'
    },
    {
      id: '2',
      name: 'Food',
      description: 'Canned goods, pasta, rice',
      productCount: 128,
      icon: '🍝'
    },
    {
      id: '3',
      name: 'Bakery',
      description: 'Bread, pastries, cakes',
      productCount: 32,
      icon: '🥖'
    },
    {
      id: '4',
      name: 'Dairy',
      description: 'Milk, cheese, yogurt',
      productCount: 56,
      icon: '🥛'
    },
    {
      id: '5',
      name: 'Snacks',
      description: 'Chips, cookies, candy',
      productCount: 89,
      icon: '🍪'
    },
    {
      id: '6',
      name: 'Household',
      description: 'Cleaning supplies, paper products',
      productCount: 67,
      icon: '🧹'
    }
  ];

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button className="bg-primary text-primary-foreground ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                        {category.icon}
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
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No categories found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
