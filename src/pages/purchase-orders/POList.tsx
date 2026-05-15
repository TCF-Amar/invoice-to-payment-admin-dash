import { Plus, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useFilterStore } from '@/store/useFilterStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { POStatus } from '@/types';

const PO_STATUSES: { value: POStatus | ''; label: string }[] = [
  { value: '', label: 'All POs' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'open', label: 'Open' },
  { value: 'partial', label: 'Partial' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function POList() {
  const navigate = useNavigate();
  const {
    poStatus,
    poSearch,
    setPOStatus,
    setPOSearch,
  } = useFilterStore();
  const { data, isLoading } = usePurchaseOrders({ status: poStatus || undefined, page: 1, limit: 20 });

  // Filter data based on search query
  const filteredData = data?.items?.filter((po: any) =>
    po.poNumber.toLowerCase().includes(poSearch.toLowerCase()) ||
    po.vendor?.name?.toLowerCase().includes(poSearch.toLowerCase())
  ) || [];

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Manage your purchase orders"
        action={
          <Button variant="primary" onClick={() => navigate('/purchase-orders/new')}>
            <Plus className="h-4 w-4" />
            Create PO
          </Button>
        }
      />

      {/* Status Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PO_STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => setPOStatus(status.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  poStatus === status.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {status.label}
              </button>
            ))}
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
              placeholder="Search by PO number or vendor name..."
              value={poSearch}
              onChange={(e) => setPOSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {poSearch && (
              <button
                onClick={() => setPOSearch('')}
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
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">PO Number</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((po: any) => (
                    <tr
                      key={po.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">{po.poNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">{po.vendor?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">
                        {formatCurrency(po.approvedAmount, po.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge status={po.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {po.deliveryDate ? formatDate(po.deliveryDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(po.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/purchase-orders/${po.id}`);
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
              title="No purchase orders found"
              description={poSearch ? 'Try adjusting your search' : poStatus ? `No POs with status "${poStatus}"` : 'Create your first purchase order'}
              action={{ label: 'Create PO', onClick: () => navigate('/purchase-orders/new') }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
