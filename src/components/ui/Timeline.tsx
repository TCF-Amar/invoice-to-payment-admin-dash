import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const Icon = event.icon;
        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  event.color || 'border-indigo-500 bg-indigo-500/10'
                )}
              >
                {Icon ? (
                  <Icon className="h-5 w-5 text-indigo-400" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                )}
              </div>
              {index < events.length - 1 && (
                <div className="my-2 h-8 w-0.5 bg-white/10" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-100">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-sm text-slate-400">{event.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
