import React from 'react';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/utils/cn';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme, sidebarCollapsed } = useUIStore();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 border-b border-white/5 bg-surface/95 backdrop-blur transition-all duration-300 z-30',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <button className="relative text-slate-400 hover:text-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <button
            onClick={toggleTheme}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>

          <button className="text-slate-400 hover:text-slate-100 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
