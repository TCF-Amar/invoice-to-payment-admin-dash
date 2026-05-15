import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Timeline } from '@/components/ui/Timeline';
import { Tabs } from '@/components/ui/Tabs';
import { usePurchaseOrder, useApprovePO, useRejectPO, useSubmitPO } from '@/hooks/usePurchaseOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export default function PODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading } = usePurchaseOrder(id || '');
  const approveMutation = useApprovePO(id || '');
  const rejectMutation = useRejectPO(id || '');
  const submitMutation = useSubmitPO(id || '');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Purchase Order Details" onBack={() => navigate('/purchase-orders')} />
        <Card>
          <CardContent className="pt-6">
            <LoadingSkeleton count={5} height="h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!po) {
    return <div className="text-center py-12 text-slate-400">PO not found</div>;
  }

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
      toast.success('PO submitted for approval');
    } catch {
      // Error handled by mutation
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(undefined);
      toast.success('PO approved');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ reason: rejectReason });
      setShowRejectModal(false);
      toast.success('PO rejected');
    } catch {
      // Error handled by mutation
    }
  };

  const poLifecycle = [
    { status: 'draft', label: 'Draft' },
    { status: 'pending_approval', label: 'Pending Approval' },
    { status: 'approved', label: 'Approved' },
    { status: 'open', label: 'Open' },
    { status: 'partial', label: 'Partial' },
    { status: 'delivered', label: 'Delivered' },
    { status: 'closed', label: 'Closed' },
  ];

  const currentStatusIndex = poLifecycle.findIndex((s) => s.status === po.status);

  const tabs = [
    {
      id: 'details',
      label: 'Details',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-400">PO Number</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{po.poNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Vendor</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{po.vendor?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Approved Amount</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                {formatCurrency(po.approvedAmount, po.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Remaining Amount</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                {formatCurrency(po.remainingAmount, po.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Delivery Date</p>
              <p className="mt-1 text-slate-100">{po.deliveryDate ? formatDate(po.deliveryDate) : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Created</p>
              <p className="mt-1 text-slate-100">{formatDate(po.createdAt)}</p>
            </div>
          </div>

          {po.description && (
            <div>
              <p className="text-sm text-slate-400">Description</p>
              <p className="mt-2 text-slate-100">{po.description}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'items',
      label: 'Line Items',
      content: (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Description</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Qty</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Unit Price</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.lineItems?.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-slate-100">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-100">{item.qty}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-100">
                    {formatCurrency(item.unitPrice, po.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-100">
                    {formatCurrency(item.total, po.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'invoices',
      label: 'Invoices',
      content: (
        <div>
          {po.invoices && po.invoices.length > 0 ? (
            <div className="space-y-2">
              {po.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-400">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                  </div>
                  <Badge status={invoice.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">No invoices linked</p>
          )}
        </div>
      ),
    },
    {
      id: 'audit',
      label: 'Audit Log',
      content: (
        <div>
          {po.auditLogs && po.auditLogs.length > 0 ? (
            <Timeline events={po.auditLogs.map((log) => ({
              id: log.id,
              title: log.eventType,
              description: log.actor ? `by ${log.actor}` : undefined,
              timestamp: log.createdAt,
            }))} />
          ) : (
            <p className="text-center text-slate-400 py-8">No audit logs</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={po.poNumber}
        description={`Status: ${po.status}`}
        onBack={() => navigate('/purchase-orders')}
        action={
          <div className="flex gap-2">
            {po.status === 'draft' && (
              <Button variant="primary" onClick={handleSubmit} isLoading={submitMutation.isPending}>
                Submit for Approval
              </Button>
            )}
            {po.status === 'pending_approval' && (
              <>
                <Button variant="primary" onClick={handleApprove} isLoading={approveMutation.isPending}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
                  Reject
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Status Timeline */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {poLifecycle.map((item, idx) => (
              <React.Fragment key={item.status}>
                <div
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    idx <= currentStatusIndex
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {item.label}
                </div>
                {idx < poLifecycle.length - 1 && (
                  <ChevronRight className={`h-4 w-4 ${idx < currentStatusIndex ? 'text-indigo-400' : 'text-slate-600'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <Tabs tabs={tabs} />
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Purchase Order">
        <div className="space-y-4">
          <div className="flex gap-3 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">This action cannot be undone. The PO will be marked as rejected.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Rejection Reason *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this PO is being rejected..."
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} isLoading={rejectMutation.isPending}>
              Reject PO
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
