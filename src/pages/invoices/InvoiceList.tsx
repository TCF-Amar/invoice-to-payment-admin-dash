import { useState } from 'react';
import { Plus, AlertCircle, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInvoices } from '@/hooks/useInvoices';
import { useFilterStore } from '@/store/useFilterStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { InvoiceStatus, Invoice } from '@/types';

const INVOICE_STATUSES: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'All Invoices' },
  { value: 'received', label: 'Received' },
  { value: 'processing', label: 'Processing' },
  { value: 'validated', label: 'Validated' },
  { value: 'review_pending', label: 'Review Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'failed', label: 'Failed' },
];

export default function InvoiceList() {
  const navigate = useNavigate();
  const {
    invoiceStatus,
    invoiceSearch,
    setInvoiceStatus,
    setInvoiceSearch,
  } = useFilterStore();
  const [showPendingReviewConfirm, setShowPendingReviewConfirm] = useState(false);
  const { data, isLoading, error } = useInvoices({ status: invoiceStatus || undefined, page: 1, limit: 20 });

  // Filter data based on search query
  const filteredData = data?.items?.filter((invoice: Invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    invoice.vendorName?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    invoice.poNumber?.toLowerCase().includes(invoiceSearch.toLowerCase())
  ) || [];

  const handlePendingReviewConfirm = () => {
    setInvoiceStatus('review_pending');
    setShowPendingReviewConfirm(false);
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage your invoices"
      />

      {/* Status Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPendingReviewConfirm(true)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedStatus === 'processing'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/50'
                }`}
              >
                ⏳ Pending Review
              </button>
              <span className="text-xs text-slate-400">Quick filter for invoices awaiting manual review</span>
            </div> */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {INVOICE_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setInvoiceStatus(status.value)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                    invoiceStatus === status.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice #, vendor name, or PO #..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {invoiceSearch && (
              <button
                onClick={() => setInvoiceSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <TableRowSkeleton columns={7} />
              <TableRowSkeleton columns={7} />
              <TableRowSkeleton columns={7} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error loading invoices: {error?.message}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Due</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((invoice: Invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">
                        <div className="flex items-center gap-2">
                          {invoice.isDuplicate && <AlertCircle className="h-4 w-4 text-orange-400" />}
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-100">{invoice.vendorName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}`);
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
              title="No invoices found"
              description={invoiceSearch ? 'Try adjusting your search' : invoiceStatus ? `No invoices with status "${invoiceStatus}"` : 'No invoices available'}
            />
          )}
        </CardContent>
      </Card>

      {/* Pending Review Confirmation Modal */}
      <Modal
        isOpen={showPendingReviewConfirm}
        onClose={() => setShowPendingReviewConfirm(false)}
        title="View Pending Review Invoices"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            This will filter and show all invoices that are currently awaiting manual review (status: Processing).
          </p>
          <p className="text-sm text-slate-400">
            You can then approve or reject each invoice individually from the invoice detail page.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowPendingReviewConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePendingReviewConfirm}
              className="flex-1"
            >
              View Pending Invoices
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
