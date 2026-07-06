import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, Clock, ArrowRight, Package } from 'lucide-react';

interface AlertItem {
  id: string;
  name: string;
  quantity: number;
  severity?: 'low' | 'medium' | 'high';
}

interface AlertCardProps {
  title: string;
  icon: any;
  iconColor: string;
  items: AlertItem[];
  onViewAll?: () => void;
  type: 'restock' | 'expiry';
}

export function AlertCard({
  title,
  icon: Icon,
  iconColor,
  items,
  onViewAll,
  type
}: AlertCardProps) {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'low':
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const getExpiryText = (days: number) => {
    if (days <= 3) return `${days}d left`;
    if (days <= 7) return `${days}d left`;
    return `${days}d left`;
  };

  return (
    <motion.div
      className="bg-card rounded-2xl border border-border shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconColor.replace('text-', 'bg-').replace('-600', '-500/10')} ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''} require attention
              </p>
            </div>
          </div>
          <Badge variant={items.length > 5 ? 'destructive' : items.length > 2 ? 'warning' : 'secondary'}>
            {items.length}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {items.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {type === 'restock' ? `${item.quantity} left in stock` : getExpiryText(item.quantity)}
                  </p>
                </div>
              </div>
              <Badge
                variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'warning' : 'secondary'}
                className="text-[10px]"
              >
                {type === 'restock' ? `${item.quantity} left` : getExpiryText(item.quantity)}
              </Badge>
            </motion.div>
          ))}
        </div>

        {items.length > 3 && (
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="w-full gap-2 group"
          >
            View All {items.length} Items
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
