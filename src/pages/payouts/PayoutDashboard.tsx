import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useVendors } from '@/hooks/useVendors';
import { useApprovedUnpaidInvoices } from '@/hooks/useInvoices';
import { useCreatePayout, useCreateBulkPayout } from '@/hooks/usePayouts';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';
import { Invoice, Vendor } from '@/types';
import toast from 'react-hot-toast';

const payoutSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice required'),
  amount: z.number().min(0, 'Amount must be positive'),
  vendorId: z.string().min(1, 'Vendor required'),
});

export default function PayoutDashboard() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const { data: vendorsData } = useVendors({ limit: 100 });
  const { data: invoicesData } = useApprovedUnpaidInvoices({ page: 1, limit: 100 });
  const createPayoutMutation = useCreatePayout();
  const createBulkPayoutMutation = useCreateBulkPayout();

  const form = useForm({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      invoiceId: '',
      amount: 0,
      vendorId: '',
    },
  });

  const handleCreatePayout = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();

    try {
      await createPayoutMutation.mutateAsync({
        invoiceId: formData.invoiceId,
        amount: formData.amount,
        vendorId: formData.vendorId,
      });
      form.reset();
      setShowPayoutModal(false);
      setSelectedVendorId('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleCreateBulkPayout = async () => {
    if (selectedPayouts.size === 0) {
      toast.error('Please select at least one payout');
      return;
    }

    const payouts = Array.from(selectedPayouts).map((id) => {
      const [, invoiceId] = id.split('|');
      const invoice = invoicesData?.items?.find((inv: Invoice) => inv.id === invoiceId);
      return {
        invoiceId,
        amount: invoice?.amountDue || 0,
      };
    });

    try {
      await createBulkPayoutMutation.mutateAsync(payouts);
      setSelectedPayouts(new Set());
      setShowBulkModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div>
      <PageHeader
        title="Payouts"
        description="Manage vendor payouts"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowBulkModal(true)}>
              <Plus className="h-4 w-4" />
              Bulk Payout
            </Button>
            <Button variant="primary" onClick={() => setShowPayoutModal(true)}>
              <Plus className="h-4 w-4" />
              Create Payout
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-100">Pending Payouts</h2>
        </CardHeader>
        <CardContent>
          {invoicesData?.items && invoicesData.items.length > 0 ? (
            <div className="space-y-2">
              {invoicesData.items.map((invoice: Invoice) => (
                <div key={invoice.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{invoice.vendor?.name}</p>
                  </div>
                  <p className="font-medium text-slate-100">{formatCurrency(invoice.amountDue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No pending payouts"
              description="All approved invoices have been paid"
            />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showPayoutModal} onClose={() => setShowPayoutModal(false)} title="Create Payout">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Vendor *</label>
            <select
              value={selectedVendorId}
              onChange={(e) => {
                const vendorId = e.target.value;
                setSelectedVendorId(vendorId);
                form.setValue('vendorId', vendorId);
                form.setValue('invoiceId', '');
                form.setValue('amount', 0);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-600 focus:border-indigo-500 focus:outline-none"
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
            <label className="block text-sm font-medium text-slate-100 mb-2">Invoice *</label>
            <select
              {...form.register('invoiceId')}
              onChange={(e) => {
                const invoiceId = e.target.value;
                form.setValue('invoiceId', invoiceId);
                
                // Auto-fill amount when invoice is selected
                if (invoiceId) {
                  const invoice = invoicesData?.items?.find((inv: Invoice) => inv.id === invoiceId);
                  if (invoice) {
                    form.setValue('amount', invoice.amountDue);
                  }
                } else {
                  form.setValue('amount', 0);
                }
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select invoice</option>
              {invoicesData?.items
                ?.filter((inv: Invoice) => inv.vendorId === selectedVendorId)
                .map((invoice: Invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {formatCurrency(invoice.amountDue)}
                  </option>
                ))}
            </select>
            {form.formState.errors.invoiceId && (
              <p className="text-xs text-rose-400 mt-1">{form.formState.errors.invoiceId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Amount *</label>
            <input
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              disabled
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none opacity-60 cursor-not-allowed"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-rose-400 mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowPayoutModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreatePayout}
              isLoading={createPayoutMutation.isPending}
              className="flex-1"
            >
              Create Payout
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Payout">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <p className="text-sm text-slate-400">Select invoices to create bulk payout</p>
          
          {invoicesData?.items && invoicesData.items.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
              <input
                ref={selectAllCheckboxRef}
                type="checkbox"
                checked={selectedPayouts.size === invoicesData.items.length && invoicesData.items.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    const allIds = new Set(
                      invoicesData.items.map((invoice: Invoice) => `${invoice.vendorId}|${invoice.id}`)
                    );
                    setSelectedPayouts(allIds);
                  } else {
                    setSelectedPayouts(new Set());
                  }
                }}
                className="rounded"
              />
              <label className="flex-1 cursor-pointer text-sm font-medium text-indigo-300">
                Select All ({invoicesData.items.length} invoices)
              </label>
            </div>
          )}

          {invoicesData?.items && invoicesData.items.length > 0 ? (
            <div className="space-y-2">
              {invoicesData.items.map((invoice: Invoice) => {
                const id = `${invoice.vendorId}|${invoice.id}`;
                const isSelected = selectedPayouts.has(id);
                return (
                  <label key={invoice.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelected = new Set(selectedPayouts);
                        if (e.target.checked) {
                          newSelected.add(id);
                        } else {
                          newSelected.delete(id);
                        }
                        setSelectedPayouts(newSelected);
                        
                        // Update select all checkbox indeterminate state
                        if (selectAllCheckboxRef.current) {
                          selectAllCheckboxRef.current.indeterminate = 
                            newSelected.size > 0 && newSelected.size < invoicesData.items.length;
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-100">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-400">{invoice.vendor?.name}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-100">{formatCurrency(invoice.amountDue)}</p>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No invoices available</p>
          )}

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowBulkModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateBulkPayout}
              isLoading={createBulkPayoutMutation.isPending}
              className="flex-1"
            >
              Create Bulk Payout ({selectedPayouts.size})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
