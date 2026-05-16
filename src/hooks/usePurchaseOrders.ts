import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { poService } from '@/api/purchaseOrders';
import { PurchaseOrder, CreatePOPayload, POStatus, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export const usePurchaseOrders = (params?: { status?: POStatus; vendorId?: string; page?: number; limit?: number }) => {
  return useQuery<PaginatedResponse<PurchaseOrder>>({
    queryKey: ['purchase-orders', params],
    queryFn: () => poService.list(params),
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => poService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePOPayload) => poService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order created successfully');
    },
    onError: () => {
      toast.error('Failed to create Purchase Order');
    },
  });
};

export const useUpdatePO = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreatePOPayload>) => poService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Purchase Order');
    },
  });
};

export const useApprovePO = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actor?: string) => poService.approve(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order approved');
    },
    onError: () => {
      toast.error('Failed to approve Purchase Order');
    },
  });
};

export const useRejectPO = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reason, actor }: { reason: string; actor?: string }) =>
      poService.reject(id, reason, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order rejected');
    },
    onError: () => {
      toast.error('Failed to reject Purchase Order');
    },
  });
};

export const useSubmitPO = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => poService.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order submitted for approval');
    },
    onError: () => {
      toast.error('Failed to submit Purchase Order');
    },
  });
};

export const useDeletePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => poService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order deleted');
    },
    onError: () => {
      toast.error('Failed to delete Purchase Order');
    },
  });
};

export const useUpdatePOStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, reason, actor }: { status: POStatus; reason?: string; actor?: string }) =>
      poService.updateStatus(id, status, reason, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order status updated');
    },
    onError: () => {
      toast.error('Failed to update Purchase Order status');
    },
  });
};
