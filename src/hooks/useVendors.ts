import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '@/api/vendors';
import { Vendor, CreateVendorPayload, UpdateVendorPayload, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export const useVendors = (params?: { search?: string; isVerified?: boolean; page?: number; limit?: number }) => {
  return useQuery<PaginatedResponse<Vendor>>({
    queryKey: ['vendors', params],
    queryFn: () => vendorService.list(params),
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorService.getById(id),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVendorPayload) => vendorService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: () => {
      toast.error('Failed to create vendor');
    },
  });
};

export const useUpdateVendor = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVendorPayload) => vendorService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated successfully');
    },
    onError: () => {
      toast.error('Failed to update vendor');
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete vendor');
    },
  });
};
