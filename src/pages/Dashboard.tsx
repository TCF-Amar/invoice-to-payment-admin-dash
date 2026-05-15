import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Clock, DollarSign, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useVendors } from '@/hooks/useVendors';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useInvoices } from '@/hooks/useInvoices';
import { useApprovedUnpaidInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useNavigate } from 'react-router-dom';

const KPICard = ({ icon: Icon, label, value, loading }: any) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          {loading ? (
            <LoadingSkeleton height="h-8" width="w-24" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
          )}
        </div>
        <div className="rounded-lg bg-indigo-500/10 p-3">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendors({ limit: 1 });
  const { data: posData, isLoading: posLoading } = usePurchaseOrders({ status: 'open', limit: 1 });
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ limit: 1 });
  const { data: approvedUnpaidData, isLoading: approvedUnpaidLoading } = useApprovedUnpaidInvoices({ limit: 10 });

  const vendorCount = vendorsData?.total || 0;
  const openPOCount = posData?.total || 0;
  const pendingInvoiceCount = invoicesData?.total || 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your business overview."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/purchase-orders/new')}>
              <Plus className="h-4 w-4" />
              New PO
            </Button>
            <Button variant="primary" onClick={() => navigate('/invoices/upload-link')}>
              <Plus className="h-4 w-4" />
              Generate Upload Link
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={TrendingUp}
          label="Total Vendors"
          value={vendorCount}
          loading={vendorsLoading}
        />
        <KPICard
          icon={FileText}
          label="Open Purchase Orders"
          value={openPOCount}
          loading={posLoading}
        />
        <KPICard
          icon={Clock}
          label="Pending Invoices"
          value={pendingInvoiceCount}
          loading={invoicesLoading}
        />
        <KPICard
          icon={DollarSign}
          label="Total Payouts (Month)"
          value="$0"
          loading={false}
        />
      </div>

      {/* Approved Unpaid Invoices */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-100">Invoice Approval Queue</h2>
        </CardHeader>
        <CardContent>
          {approvedUnpaidLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton count={3} height="h-12" />
            </div>
          ) : approvedUnpaidData?.items && approvedUnpaidData.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Due Date</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUnpaidData.items.map((invoice: any) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-100">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">{invoice.vendorName}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/payments?invoiceId=${invoice.id}`)}
                        >
                          Pay Now
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">No pending invoices</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
