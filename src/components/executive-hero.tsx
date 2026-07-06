import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Plus, ShoppingCart, Package, FileText } from 'lucide-react';

interface ExecutiveHeroProps {
  userName?: string;
  todayRevenue: number;
  todaySalesCount: number;
  onNewSale?: () => void;
  onAddProduct?: () => void;
  onReceiveStock?: () => void;
}

export function ExecutiveHero({
  userName = 'Admin',
  todayRevenue,
  todaySalesCount,
  onNewSale,
  onAddProduct,
  onReceiveStock
}: ExecutiveHeroProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-border/50 p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Welcome back. Here's what's happening in your business today.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Today's Revenue
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-bold text-foreground tracking-tight">
                {formatCurrency(todayRevenue)}
              </h2>
              <span className="text-sm font-semibold text-emerald-600">
                +{todaySalesCount} Sales Today
              </span>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button
              variant="primary"
              onClick={onNewSale}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Sale
            </Button>
            <Button
              variant="secondary"
              onClick={onAddProduct}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={onReceiveStock}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Receive Stock
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
