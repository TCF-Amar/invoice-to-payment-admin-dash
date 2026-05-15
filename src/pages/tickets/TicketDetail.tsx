import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useTicket, useUpdateTicketStatus, useUpdateTicketPriority } from '@/hooks/useTickets';
import { formatDate } from '@/utils/formatDate';
import { TicketStatus, TicketPriority } from '@/types';

const statuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading } = useTicket(id || '');
  const updateStatusMutation = useUpdateTicketStatus(id || '');
  const updatePriorityMutation = useUpdateTicketPriority(id || '');

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Ticket Details" onBack={() => navigate('/tickets')} />
        <Card>
          <CardContent className="pt-6">
            <LoadingSkeleton count={5} height="h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Ticket not found</p>
        <Button variant="primary" onClick={() => navigate('/tickets')}>
          <ChevronLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: TicketStatus) => {
    await updateStatusMutation.mutateAsync(status);
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    await updatePriorityMutation.mutateAsync(priority);
  };

  return (
    <div>
      <PageHeader
        title={ticket.subject}
        onBack={() => navigate('/tickets')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-100">Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {(ticket.vendorId || ticket.invoiceId) && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-100">Related Items</h2>
              </CardHeader>
              <CardContent className="space-y-2">
                {ticket.vendorId && (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Vendor ID</p>
                    <p className="text-sm font-medium text-slate-100">{ticket.vendorId}</p>
                  </div>
                )}
                {ticket.invoiceId && (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Invoice ID</p>
                    <p className="text-sm font-medium text-slate-100">{ticket.invoiceId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-100">Status</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-3">
                <Badge status={ticket.status} />
              </div>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updateStatusMutation.isPending}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ticket.status === status
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    } disabled:opacity-50`}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-100">Priority</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-3">
                <Badge status={ticket.priority} />
              </div>
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                    disabled={updatePriorityMutation.isPending}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ticket.priority === priority
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    } disabled:opacity-50`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-100">Details</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Created</p>
                <p className="text-sm text-slate-100">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Last Updated</p>
                <p className="text-sm text-slate-100">{formatDate(ticket.updatedAt || ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Ticket ID</p>
                <p className="text-sm font-mono text-slate-100">{ticket.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
