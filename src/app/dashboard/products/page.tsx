'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Package, Search, Plus, Edit, Trash2, Filter, ArrowUpDown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Mock data for products
  const products = [
    {
      id: '1',
      name: 'Coca-Cola 50cl',
      sku: 'CC-50CL',
      category: 'Beverages',
      price: 150,
      cost: 100,
      stock: 45,
      lowStockThreshold: 10,
      barcode: '1234567890123',
      status: 'active'
    },
    {
      id: '2',
      name: 'Indomie Chicken',
      sku: 'IND-CHK',
      category: 'Food',
      price: 100,
      cost: 75,
      stock: 8,
      lowStockThreshold: 15,
      barcode: '1234567890124',
      status: 'active'
    },
    {
      id: '3',
      name: 'Bread Sliced',
      sku: 'BRD-SLC',
      category: 'Bakery',
      price: 800,
      cost: 600,
      stock: 0,
      lowStockThreshold: 5,
      barcode: '1234567890125',
      status: 'active'
    },
    {
      id: '4',
      name: 'Fresh Milk 1L',
      sku: 'MLK-1L',
      category: 'Dairy',
      price: 1200,
      cost: 900,
      stock: 25,
      lowStockThreshold: 10,
      barcode: '1234567890126',
      status: 'active'
    },
    {
      id: '5',
      name: 'Rice 5kg',
      sku: 'RIC-5KG',
      category: 'Food',
      price: 4500,
      cost: 3500,
      stock: 30,
      lowStockThreshold: 10,
      barcode: '1234567890127',
      status: 'active'
    }
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  const getStockStatus = (product: any) => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (product.stock <= product.lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Product Catalog" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="beverages">Beverages</option>
              <option value="food">Food</option>
              <option value="bakery">Bakery</option>
              <option value="dairy">Dairy</option>
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        <p className="text-xs text-muted-foreground">{product.barcode}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium text-foreground">{product.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-medium text-foreground">{product.stock} units</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-bold text-foreground">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-medium text-foreground">{formatCurrency(product.cost)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
