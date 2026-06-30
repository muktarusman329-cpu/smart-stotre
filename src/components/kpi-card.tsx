import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'text-blue-600'
}: KPICardProps) {
  return (
    <motion.div
      className="group bg-card rounded-xl p-6 border border-border shadow-lg hover:shadow-2xl transition-all duration-500"
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <motion.p 
            className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {title}
          </motion.p>
          <div className="flex items-baseline space-x-1">
            <motion.h2 
              className="text-3xl font-bold text-foreground tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.h2>
          </div>
          {change && (
            <motion.div 
              className="flex items-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <motion.span 
                className={cn(
                  "px-2.5 py-1 rounded-full text-[12px] font-bold inline-flex items-center",
                  changeType === 'positive' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                  changeType === 'negative' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : 
                  "bg-secondary text-muted-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '•'} {change}
              </motion.span>
            </motion.div>
          )}
        </div>
        <motion.div 
          className={cn(
            "p-4 rounded-xl shadow-sm",
            iconColor.replace('text-', 'bg-').replace('-600', '-500/20'),
            "bg-secondary",
            iconColor
          )}
          whileHover={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: 1.15,
            transition: { duration: 0.5 }
          }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}
