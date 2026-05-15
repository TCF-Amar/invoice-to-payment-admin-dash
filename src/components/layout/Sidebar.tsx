import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Zap,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Vendors', href: '/vendors' },
  { icon: FileText, label: 'Purchase Orders', href: '/purchase-orders' },
  { icon: Receipt, label: 'Invoices', href: '/invoices' },
  { icon: Zap, label: 'Payouts', href: '/payouts' },
  { icon: Ticket, label: 'Tickets', href: '/tickets' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r border-white/5 bg-surface transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">IP</span>
            </div>
            <span className="font-bold text-slate-100">Invoice Portal</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                isActive
                  ? 'border-l-2 border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
