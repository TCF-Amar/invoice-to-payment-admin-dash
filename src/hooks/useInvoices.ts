import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/api/invoices';
import { Invoice, CreateInvoicePayload, InvoiceStatus } from '@/types';
import toast from 'react-hot-toast';

export const useInvoices = (params?: { status?: InvoiceStatus; vendorId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.list(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
};

export const useApprovedUnpaidInvoices = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['invoices-approved-unpaid', params],
    queryFn: () => invoiceService.getApprovedUnpaid(params),
    refetchInterval: 30000,
  });
};

export const useCheckDuplicate = (invoiceNumber: string) => {
  return useQuery({
    queryKey: ['invoice-duplicate', invoiceNumber],
    queryFn: () => invoiceService.checkDuplicate(invoiceNumber),
    enabled: !!invoiceNumber,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => invoiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-approved-unpaid'] });
      toast.success('Invoice created successfully');
    },
    onError: () => {
      toast.error('Failed to create invoice');
    },
  });
};

export const useUpdateInvoice = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateInvoicePayload>) => invoiceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: () => {
      toast.error('Failed to update invoice');
    },
  });
};

export const useUpdateInvoiceStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, rejectionReason }: { status: InvoiceStatus; rejectionReason?: string }) =>
      invoiceService.updateStatus(id, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-approved-unpaid'] });
      toast.success('Invoice status updated');
    },
    onError: () => {
      toast.error('Failed to update invoice status');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted');
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    },
  });
};
