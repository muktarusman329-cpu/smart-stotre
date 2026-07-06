import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  FileText, 
  Wallet, 
  Printer,
  Plus,
  ArrowRight
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  onClick: () => void;
  color: string;
}

interface QuickActionsProps {
  onNewSale?: () => void;
  onAddProduct?: () => void;
  onReceiveStock?: () => void;
  onGenerateReport?: () => void;
  onRecordExpense?: () => void;
  onPrintReceipt?: () => void;
  allowedActions?: string[];
}

export function QuickActions({
  onNewSale,
  onAddProduct,
  onReceiveStock,
  onGenerateReport,
  onRecordExpense,
  onPrintReceipt,
  allowedActions
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'new-sale',
      label: 'New Sale',
      icon: ShoppingCart,
      onClick: onNewSale || (() => {}),
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20'
    },
    {
      id: 'add-product',
      label: 'Add Product',
      icon: Package,
      onClick: onAddProduct || (() => {}),
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20'
    },
    {
      id: 'receive-stock',
      label: 'Receive Stock',
      icon: Truck,
      onClick: onReceiveStock || (() => {}),
      color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20'
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      onClick: onGenerateReport || (() => {}),
      color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20'
    },
    {
      id: 'record-expense',
      label: 'Record Expense',
      icon: Wallet,
      onClick: onRecordExpense || (() => {}),
      color: 'from-orange-500/20 to-orange-500/5 border-orange-500/20'
    },
    {
      id: 'print-receipt',
      label: 'Print Receipt',
      icon: Printer,
      onClick: onPrintReceipt || (() => {}),
      color: 'from-rose-500/20 to-rose-500/5 border-rose-500/20'
    }
  ];

  const visibleActions = actions.filter((action) => !allowedActions || allowedActions.includes(action.id));

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-primary" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {visibleActions.map((action, index) => (
          <motion.button
            key={action.label}
            onClick={action.onClick}
            className={`
              relative group p-4 rounded-2xl border bg-gradient-to-br ${action.color}
              hover:shadow-lg hover:scale-105 transition-all duration-300
              text-left overflow-hidden
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative z-10">
              <div className="mb-3">
                <action.icon className="h-6 w-6 text-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {action.label}
              </p>
            </div>
            <motion.div
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -10 }}
              whileHover={{ x: 0 }}
            >
              <ArrowRight className="h-4 w-4 text-foreground/50" />
            </motion.div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
