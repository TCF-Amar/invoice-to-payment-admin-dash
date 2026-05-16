// Status color mappings for all entity types

export const statusColorMap: Record<string, string> = {
  // PO Statuses
  draft: '#475569',
  pending_approval: '#F59E0B',
  approved: '#3B82F6',
  rejected: '#F43F5E',
  open: '#8B5CF6',
  partial: '#F97316',
  delivered: '#14B8A6',
  closed: '#10B981',
  cancelled: '#71717A',

  // Invoice Statuses
  received: '#0EA5E9',
  processing: '#3B82F6',
  validated: '#0EA5E9',
  review_pending: '#F59E0B',
  paid: '#10B981',
  duplicate: '#F97316',
  failed: '#F43F5E',

  // Payment Statuses
  scheduled: '#F59E0B',
  completed: '#10B981',
  refunded: '#8B5CF6',

  // Ticket Statuses
  in_progress: '#3B82F6',
  resolved: '#10B981',

  // Ticket Priorities
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  urgent: '#F43F5E',
};

export const statusLabelMap: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  open: 'Open',
  partial: 'Partial',
  delivered: 'Delivered',
  closed: 'Closed',
  cancelled: 'Cancelled',
  received: 'Received',
  processing: 'Processing',
  validated: 'Validated',
  review_pending: 'Review Pending',
  paid: 'Paid',
  duplicate: 'Duplicate',
  failed: 'Failed',
  scheduled: 'Scheduled',
  completed: 'Completed',
  refunded: 'Refunded',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const statusBgColorMap: Record<string, string> = {
  draft: 'bg-slate-500/10',
  pending_approval: 'bg-amber-500/10',
  approved: 'bg-blue-500/10',
  rejected: 'bg-rose-500/10',
  open: 'bg-violet-500/10',
  partial: 'bg-orange-500/10',
  delivered: 'bg-teal-500/10',
  closed: 'bg-emerald-500/10',
  cancelled: 'bg-rose-500/10',
  received: 'bg-sky-500/10',
  processing: 'bg-blue-500/10',
  validated: 'bg-sky-500/10',
  review_pending: 'bg-amber-500/10',
  paid: 'bg-emerald-500/10',
  duplicate: 'bg-orange-500/10',
  failed: 'bg-rose-500/10',
  scheduled: 'bg-amber-500/10',
  completed: 'bg-emerald-500/10',
  refunded: 'bg-violet-500/10',
  in_progress: 'bg-blue-500/10',
  resolved: 'bg-emerald-500/10',
  low: 'bg-emerald-500/10',
  medium: 'bg-amber-500/10',
  high: 'bg-orange-500/10',
  urgent: 'bg-rose-500/10',
  
};

export const statusTextColorMap: Record<string, string> = {
  draft: 'text-slate-400',
  pending_approval: 'text-amber-400',
  approved: 'text-blue-400',
  rejected: 'text-rose-400',
  open: 'text-violet-400',
  partial: 'text-orange-400',
  delivered: 'text-teal-400',
  closed: 'text-emerald-400',
  cancelled: 'text-rose-400',
  received: 'text-sky-400',
  processing: 'text-blue-400',
  validated: 'text-sky-400',
  review_pending: 'text-amber-400',
  paid: 'text-emerald-400',
  duplicate: 'text-orange-400',
  failed: 'text-rose-400',
  scheduled: 'text-amber-400',
  completed: 'text-emerald-400',
  refunded: 'text-violet-400',
  in_progress: 'text-blue-400',
  resolved: 'text-emerald-400',
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  urgent: 'text-rose-400',
};

export function getStatusColor(status: string): string {
  return statusColorMap[status] || '#6B7280';
}

export function getStatusLabel(status: string): string {
  return statusLabelMap[status] || status;
}

export function getStatusBgColor(status: string): string {
  return statusBgColorMap[status] || 'bg-gray-500/10';
}

export function getStatusTextColor(status: string): string {
  return statusTextColorMap[status] || 'text-gray-400';
}
