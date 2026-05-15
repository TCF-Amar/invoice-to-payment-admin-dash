import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/utils/cn';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <TopBar />
      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
