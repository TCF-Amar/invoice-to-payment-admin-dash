import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/api/payments';
import { CreatePaymentRequest, Invoice, CreatePaymentResponse } from '@/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface PaymentErrorResponse {
  message?: string;
  error?: string;
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentRequest) => paymentService.create(payload),
    
    // Optimistic update: immediately update invoice status to 'paid' in cache
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['invoice', variables.invoiceId] });
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      await queryClient.cancelQueries({ queryKey: ['invoices-approved-unpaid'] });

      // Snapshot the previous values
      const previousInvoice = queryClient.getQueryData(['invoice', variables.invoiceId]);
      const previousInvoices = queryClient.getQueryData(['invoices']);
      const previousApprovedUnpaid = queryClient.getQueryData(['invoices-approved-unpaid']);

      // Optimistically update invoice status to 'paid'
      queryClient.setQueryData(['invoice', variables.invoiceId], (old: Invoice | undefined) => {
        if (!old) return old;
        return { ...old, status: 'paid' as const };
      });

      // Return context with previous values for rollback
      return { previousInvoice, previousInvoices, previousApprovedUnpaid, invoiceId: variables.invoiceId };
    },

    onSuccess: (data: CreatePaymentResponse, variables) => {
      // Invalidate and refetch invoice queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-approved-unpaid'] });

      // Display success notification with invoice details (fallback to request payload if response is missing fields)
      const amount = data?.amount ?? variables.amount;
      const currency = data?.currency ?? variables.currency;
      toast.success(
        `Payment of ${currency} ${Number(amount).toFixed(2)} processed successfully`,
        { duration: 4000 }
      );
    },

    onError: (error: AxiosError<PaymentErrorResponse>, variables, context) => {
      // Rollback optimistic updates on error
      if (context) {
        if (context.previousInvoice) {
          queryClient.setQueryData(['invoice', context.invoiceId], context.previousInvoice);
        }
        if (context.previousInvoices) {
          queryClient.setQueryData(['invoices'], context.previousInvoices);
        }
        if (context.previousApprovedUnpaid) {
          queryClient.setQueryData(['invoices-approved-unpaid'], context.previousApprovedUnpaid);
        }
      }

      // Parse error response and display appropriate message
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;

      let displayMessage = 'Failed to process payment';

      switch (status) {
        case 400:
          displayMessage = 'Invalid payment request. Please refresh and try again.';
          break;
        case 401:
          displayMessage = 'Session expired. Please log in again.';
          break;
        case 403:
          displayMessage = "You don't have permission to process payments.";
          break;
        case 409:
          displayMessage = 'This invoice is already being processed.';
          // Automatically refresh invoice data after 5 seconds on 409 error
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoices-approved-unpaid'] });
          }, 5000);
          break;
        case 500:
          displayMessage = 'Payment system unavailable. Please try again later.';
          break;
        default:
          if (errorMessage) {
            displayMessage = errorMessage;
          }
      }

      // Display error toast that remains visible until dismissed
      toast.error(displayMessage, { duration: Infinity });
    },
  });
};
