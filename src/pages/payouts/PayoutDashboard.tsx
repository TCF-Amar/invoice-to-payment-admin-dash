import { useState, useRef, useEffect } from 'react';
import { Plus, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useVendors } from '@/hooks/useVendors';
import { useApprovedUnpaidInvoices } from '@/hooks/useInvoices';
import { useStripeStatus, useSetupStripeVendor, useGetOnboardingLink, useCreatePayout, useCreateBulkPayout } from '@/hooks/usePayouts';
import { LoadingSkeleton, TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

const payoutSchema = z.object({
  vendorId: z.string().min(1, 'Vendor required'),
  invoiceId: z.string().min(1, 'Invoice required'),
  amount: z.number().min(0, 'Amount must be positive'),
});

export default function PayoutDashboard() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const { data: vendorsData, isLoading: vendorsLoading } = useVendors({ limit: 100 });
  const { data: invoicesData } = useApprovedUnpaidInvoices({ page: 1, limit: 100 });
  const setupStripeMutation = useSetupStripeVendor();
  const getOnboardingLinkMutation = useGetOnboardingLink();
  const createPayoutMutation = useCreatePayout();
  const createBulkPayoutMutation = useCreateBulkPayout();

  const form = useForm({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      vendorId: '',
      invoiceId: '',
      amount: 0,
    },
  });

  const handleSetupStripe = async (vendorId: string) => {
    try {
      await setupStripeMutation.mutateAsync(vendorId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleGetOnboardingLink = async (vendorId: string) => {
    try {
      const result = await getOnboardingLinkMutation.mutateAsync(vendorId);
      if (result?.url) {
        window.open(result.url, '_blank');
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleCreatePayout = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    const invoice = invoicesData?.items?.find((inv: any) => inv.id === formData.invoiceId) as any;
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }

    try {
      await createPayoutMutation.mutateAsync({
        vendorId: formData.vendorId,
        invoiceId: formData.invoiceId,
        amount: formData.amount,
        currency: invoice?.currency || 'USD',
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
      const [vendorId, invoiceId] = id.split('|');
      const invoice = invoicesData?.items?.find((inv: any) => inv.id === invoiceId) as any;
      return {
        vendorId,
        invoiceId,
        amount: invoice?.amountDue || 0,
      };
    });

    try {
      await createBulkPayoutMutation.mutateAsync({ payouts });
      setSelectedPayouts(new Set());
      setShowBulkModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const getStripeStatus = (vendorId: string) => {
    // This would need to be fetched per vendor, simplified for now
    return { payoutsEnabled: false, chargesEnabled: false };
  };

  return (
    <div>
      <PageHeader
        title="Stripe Payouts"
        description="Manage vendor payouts and Stripe integration"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">Vendor Stripe Status</h2>
          </CardHeader>
          <CardContent>
            {vendorsLoading ? (
              <div className="space-y-4">
                <TableRowSkeleton columns={3} />
                <TableRowSkeleton columns={3} />
              </div>
            ) : vendorsData?.items && vendorsData.items.length > 0 ? (
              <div className="space-y-3">
                {vendorsData.items.map((vendor: any) => {
                  const status = getStripeStatus(vendor.id);
                  return (
                    <div key={vendor.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-100">{vendor.name}</p>
                        {status.payoutsEnabled ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{vendor.email}</p>
                      <div className="flex gap-2">
                        {!status.payoutsEnabled && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetupStripe(vendor.id)}
                              isLoading={setupStripeMutation.isPending}
                              className="flex-1"
                            >
                              Setup Account
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleGetOnboardingLink(vendor.id)}
                              isLoading={getOnboardingLinkMutation.isPending}
                              className="flex-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Onboard
                            </Button>
                          </>
                        )}
                        {status.payoutsEnabled && (
                          <Badge status="completed" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Plus}
                title="No vendors"
                description="Create vendors to manage payouts"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">Pending Payouts</h2>
          </CardHeader>
          <CardContent>
            {invoicesData?.items && invoicesData.items.length > 0 ? (
              <div className="space-y-2">
                {invoicesData.items.slice(0, 5).map((invoice: any) => (
                  <div key={invoice.id} className="flex justify-between items-center p-2 bg-white/5 rounded text-sm">
                    <div>
                      <p className="text-slate-100">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-400">{invoice.vendor?.name}</p>
                    </div>
                    <p className="font-medium text-slate-100">{formatCurrency(invoice.amountDue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No pending payouts</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showPayoutModal} onClose={() => setShowPayoutModal(false)} title="Create Payout">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Vendor *</label>
            <select
              {...form.register('vendorId')}
              onChange={(e) => {
                form.setValue('vendorId', e.target.value);
                setSelectedVendorId(e.target.value);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select vendor</option>
              {vendorsData?.items?.map((vendor: any) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            {form.formState.errors.vendorId && (
              <p className="text-xs text-rose-400 mt-1">{form.formState.errors.vendorId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Invoice *</label>
            <select
              {...form.register('invoiceId')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select invoice</option>
              {invoicesData?.items
                ?.filter((inv: any) => inv.vendorId === selectedVendorId)
                .map((invoice: any) => (
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
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
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
                      invoicesData.items.map((invoice: any) => `${invoice.vendorId}|${invoice.id}`)
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
              {invoicesData.items.map((invoice: any) => {
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
