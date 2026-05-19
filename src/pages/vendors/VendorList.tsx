import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import {  TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { DrawerPanel } from '@/components/ui/DrawerPanel';
import { VendorForm } from '@/components/forms/VendorForm';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/useVendors';
import { useNavigate } from 'react-router-dom';
import { Vendor, CreateVendorPayload } from '@/types';

export default function VendorList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | undefined>();
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const { data, isLoading } = useVendors({ search, isVerified, page: 1, limit: 20 });
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor(selectedVendor?.id || '');
  const deleteMutation = useDeleteVendor();

  const handleCreate = () => {
    setSelectedVendor(null);
    setShowDrawer(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDrawer(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteMutation.mutateAsync(vendorId);
      } catch {
        // Error handled by mutation
      }
    }
  };

  const handleSubmit = async (data: CreateVendorPayload) => {
    try {
      if (selectedVendor) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowDrawer(false);
      setSelectedVendor(null);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage your vendor relationships"
        action={
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchInput placeholder="Search vendors..." onSearch={setSearch} />
            </div>
            <button
              onClick={() => setIsVerified(isVerified ? undefined : true)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isVerified
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'border-white/10 text-slate-400 hover:text-slate-100'
              }`}
            >
              Verified Only
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <TableRowSkeleton columns={6} />
              <TableRowSkeleton columns={6} />
              <TableRowSkeleton columns={6} />
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">GSTIN</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((vendor: Vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-slate-100">{vendor.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{vendor.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{vendor.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {vendor.isVerified ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{vendor.gstin || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(vendor)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(vendor.id)}
                            isLoading={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No vendors yet"
              description="Create your first vendor to get started"
              action={{ label: 'Add Vendor', onClick: handleCreate }}
            />
          )}
        </CardContent>
      </Card>

      <DrawerPanel
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setSelectedVendor(null);
        }}
        title={selectedVendor ? 'Edit Vendor' : 'Create Vendor'}
      >
        <VendorForm
          initialData={selectedVendor || undefined}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </DrawerPanel>
    </div>
  );
}
