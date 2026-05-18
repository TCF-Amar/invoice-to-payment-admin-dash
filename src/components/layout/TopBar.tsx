import React from 'react';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme, sidebarCollapsed } = useUIStore();
  const userEmail = useAuthStore((s) => s.userEmail);
  const userRole = useAuthStore((s) => s.userRole);
  const { logout } = useAuth();

  // Use first character of email for the avatar fallback so it reflects
  // the signed-in user instead of a hard-coded letter.
  const avatarInitial = userEmail?.charAt(0).toUpperCase() ?? 'U';

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
          <button
            type="button"
            aria-label="Notifications"
            className="relative text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {(userEmail || userRole) && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              {userEmail && (
                <span
                  className="text-sm text-slate-100 font-medium max-w-[200px] truncate"
                  title={userEmail}
                >
                  {userEmail}
                </span>
              )}
              {userRole && (
                <span className="text-xs text-slate-400 capitalize">
                  {userRole}
                </span>
              )}
            </div>
          )}

          <div
            aria-hidden="true"
            className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm"
          >
            {avatarInitial}
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
