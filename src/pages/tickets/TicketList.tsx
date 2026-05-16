import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTickets, useCreateTicket } from '@/hooks/useTickets';
import {  TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { useVendors } from '@/hooks/useVendors';
import { useApprovedUnpaidInvoices } from '@/hooks/useInvoices';
import { Ticket, Vendor, Invoice } from '@/types';
import toast from 'react-hot-toast';

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject required'),
  description: z.string().min(1, 'Description required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  vendorId: z.string().optional(),
  invoiceId: z.string().optional(),
});

export default function TicketList() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading } = useTickets({ page: 1, limit: 20 });
  const createTicketMutation = useCreateTicket();
  const { data: vendorsData } = useVendors({ limit: 100 });
  const { data: invoicesData } = useApprovedUnpaidInvoices({ page: 1, limit: 100 });

  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium' as const,
      vendorId: '',
      invoiceId: '',
    },
  });

  const handleCreateTicket = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    try {
      await createTicketMutation.mutateAsync({
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        vendorId: formData.vendorId || undefined,
        invoiceId: formData.invoiceId || undefined,
      });
      form.reset();
      setShowCreateModal(false);
      toast.success('Ticket created successfully');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage support tickets"
        action={
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Raise Ticket
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <TableRowSkeleton columns={5} />
              <TableRowSkeleton columns={5} />
              <TableRowSkeleton columns={5} />
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Priority</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((ticket: Ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-slate-100">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge status={ticket.priority} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${ticket.id}`);
                        }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No tickets yet"
              description="Raise a support ticket"
              action={{ label: 'Raise Ticket', onClick: () => setShowCreateModal(true) }}
            />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Raise Support Ticket">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Subject *</label>
            <input
              {...form.register('subject')}
              placeholder="Brief description of the issue"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {form.formState.errors.subject && (
              <p className="text-xs text-rose-400 mt-1">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Description *</label>
            <textarea
              {...form.register('description')}
              placeholder="Detailed description of the issue"
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
            {form.formState.errors.description && (
              <p className="text-xs text-rose-400 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Priority *</label>
            <select
              {...form.register('priority')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Vendor (Optional)</label>
            <select
              {...form.register('vendorId')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select vendor</option>
              {vendorsData?.items?.map((vendor: Vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Invoice (Optional)</label>
            <select
              {...form.register('invoiceId')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select invoice</option>
              {invoicesData?.items?.map((invoice: Invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTicket}
              isLoading={createTicketMutation.isPending}
              className="flex-1"
            >
              Create Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
