import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Vendor } from '@/types';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (data: VendorFormData) => Promise<void>;
  isLoading?: boolean;
}

export const VendorForm: React.FC<VendorFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-100 mb-2">Vendor Name *</label>
        <input
          {...register('name')}
          placeholder="Acme Corp"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-100 mb-2">Email *</label>
        <input
          {...register('email')}
          type="email"
          placeholder="vendor@example.com"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-100 mb-2">Phone</label>
          <input
            {...register('phone')}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-100 mb-2">GSTIN</label>
          <input
            {...register('gstin')}
            placeholder="27AABCT1234H1Z0"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-100 mb-2">Address</label>
        <textarea
          {...register('address')}
          placeholder="123 Business St, City, State 12345"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Bank Details (Optional)</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Bank Name</label>
            <input
              {...register('bankName')}
              placeholder="Bank of America"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Account Name</label>
            <input
              {...register('accountName')}
              placeholder="Acme Corp Account"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Account Number</label>
            <input
              {...register('accountNumber')}
              placeholder="1234567890"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Routing Number</label>
            <input
              {...register('routingNumber')}
              placeholder="021000021"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Vendor' : 'Create Vendor'}
        </Button>
      </div>
    </form>
  );
};
