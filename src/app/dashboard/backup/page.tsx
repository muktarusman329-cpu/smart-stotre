'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Database, Download, Upload, Clock, HardDrive, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BackupPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Mock data for backups
  const backups = [
    {
      id: 'BKP-001',
      name: 'Daily Backup - Jan 15, 2024',
      size: '2.4 GB',
      createdAt: new Date('2024-01-15T02:00:00'),
      type: 'automatic',
      status: 'completed'
    },
    {
      id: 'BKP-002',
      name: 'Daily Backup - Jan 14, 2024',
      size: '2.3 GB',
      createdAt: new Date('2024-01-14T02:00:00'),
      type: 'automatic',
      status: 'completed'
    },
    {
      id: 'BKP-003',
      name: 'Manual Backup - Jan 13, 2024',
      size: '2.3 GB',
      createdAt: new Date('2024-01-13T15:30:00'),
      type: 'manual',
      status: 'completed'
    },
    {
      id: 'BKP-004',
      name: 'Weekly Backup - Jan 7, 2024',
      size: '2.2 GB',
      createdAt: new Date('2024-01-07T02:00:00'),
      type: 'automatic',
      status: 'completed'
    }
  ];

  const handleBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Backup & Restore" userRole="admin" />
      
      <main className="py-6">
        {/* Backup Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Create Backup</h3>
                  <p className="text-sm text-muted-foreground">Backup entire database</p>
                </div>
              </div>
              
              {isBackingUp ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold text-foreground">{backupProgress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${backupProgress}%` }}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Pause className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleBackup}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Backup
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Restore Backup</h3>
                  <p className="text-sm text-muted-foreground">Restore from backup file</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".backup,.sql,.json"
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup Schedule */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Backup Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Daily Backup</span>
                </div>
                <p className="text-sm text-muted-foreground">Every day at 2:00 AM</p>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Weekly Backup</span>
                </div>
                <p className="text-sm text-muted-foreground">Every Sunday at 3:00 AM</p>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Monthly Backup</span>
                </div>
                <p className="text-sm text-muted-foreground">1st of every month at 4:00 AM</p>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Storage Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                 <span className="text-sm text-muted-foreground">Total Backups</span>
                </div>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Size</span>
                </div>
                <p className="text-2xl font-bold text-foreground">52.4 GB</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Oldest Backup</span>
                </div>
                <p className="text-2xl font-bold text-foreground">90 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Backups */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Recent Backups</h3>
            <div className="space-y-3">
              {backups.map((backup, index) => (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{backup.name}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{backup.size}</span>
                        <span>•</span>
                        <span>{backup.createdAt.toLocaleString()}</span>
                        <span>•</span>
                        <span className="capitalize">{backup.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      Restore
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
