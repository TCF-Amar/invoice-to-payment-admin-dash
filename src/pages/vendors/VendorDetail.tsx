import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useVendor } from '@/hooks/useVendors';

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendor(id || '');

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Vendor Details" onBack={() => navigate('/vendors')} />
        <Card>
          <CardContent className="pt-6">
            <LoadingSkeleton count={5} height="h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vendor) {
    return <div className="text-center py-12 text-slate-400">Vendor not found</div>;
  }

  return (
    <div>
      <PageHeader title={vendor.name} description={vendor.email} onBack={() => navigate('/vendors')} />
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-1 text-slate-100">{vendor.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="mt-1 text-slate-100">{vendor.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">GSTIN</p>
              <p className="mt-1 text-slate-100">{vendor.gstin || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Address</p>
              <p className="mt-1 text-slate-100">{vendor.address || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
