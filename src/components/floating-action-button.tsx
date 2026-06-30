'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, Package, Users, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: ShoppingCart, label: 'New Sale', href: '/dashboard/pos', color: 'bg-emerald-500' },
    { icon: Package, label: 'Add Product', href: '/dashboard/inventory/new', color: 'bg-blue-500' },
    { icon: Users, label: 'New Customer', href: '/dashboard/customers/new', color: 'bg-purple-500' },
    { icon: MessageSquare, label: 'AI Chat', href: '/dashboard/ai-assistant', color: 'bg-indigo-500' },
  ];

  return (
    <motion.div 
      className="fixed bottom-8 right-8 z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.8 }}
    >
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col-reverse items-end mb-4 space-y-reverse space-y-4">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ 
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center group"
                >
                  <motion.span 
                    className="mr-3 px-3 py-1 bg-card border border-border rounded-lg text-sm font-semibold text-foreground shadow-sm whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {action.label}
                  </motion.span>
                  <motion.div 
                    className={`${action.color} p-3 rounded-2xl text-white shadow-lg`}
                    whileHover={{ 
                      scale: 1.15,
                      rotate: 5,
                      boxShadow: '0 0 20px rgba(0,0,0,0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <action.icon className="h-6 w-6" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
        }}
        whileTap={{ scale: 0.9 }}
        className={`${isOpen ? 'bg-secondary' : 'bg-primary'} p-4 rounded-3xl text-primary-foreground shadow-2xl shadow-primary/20 flex items-center justify-center transition-colors`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Plus className="h-8 w-8" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
