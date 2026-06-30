'use client';

import { Bell, Search, User, Command, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  title: string;
  userRole: string;
}

export function DashboardHeader({ title, userRole }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        const data = await response.json();
        if (data.success) setUnreadCount(data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/pos?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 py-3 shadow-sm' 
          : 'bg-transparent py-6'
      } px-8`}
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div 
            className="p-2 bg-primary rounded-xl lg:hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Command className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <motion.h1 
              className="text-2xl font-black text-foreground tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {title}
            </motion.h1>
            <motion.p 
              className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              Terminal 01 • Active
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-6"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Search */}
          <motion.form 
            onSubmit={handleSearch} 
            className="relative hidden xl:block group"
            whileFocus={{ scale: 1.02 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <motion.input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-secondary/50 border-none rounded-xl focus:ring-2 focus:ring-ring/10 focus:bg-background transition-all w-80 text-sm font-semibold outline-none text-foreground placeholder:text-muted-foreground"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          </motion.form>

          <div className="flex items-center space-x-3 border-l border-border pl-6">
            {/* Theme Toggle */}
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 text-muted-foreground hover:bg-accent rounded-xl transition-all"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {/* Notifications */}
            <Link href="/dashboard/notifications" className="relative">
              <motion.div 
                className="p-2.5 text-muted-foreground hover:bg-accent rounded-xl transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-5 w-5" />
              </motion.div>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 h-5 w-5 bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center rounded-full border-[3px] border-background ring-1 ring-destructive/20"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Link>

            {/* User menu */}
            <motion.div 
              className="flex items-center space-x-3 p-1.5 pr-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {userRole.charAt(0).toUpperCase()}
              </motion.div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-foreground leading-none">{userRole.toUpperCase()}</p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 mt-1 uppercase tracking-tighter">Verified</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
