import api from './client';
import { CreatePaymentRequest, CreatePaymentResponse } from '@/types';

/**
 * Payment service for managing invoice payments
 */
export const paymentService = {
  /**
   * Create a payment for an approved invoice
   * @param payload - Payment request containing invoiceId, amount, and currency
   * @returns Promise resolving to payment response with transaction details
   * @throws Error with specific messages for different HTTP status codes:
   *   - 400: Invalid invoice ID or amount
   *   - 401: Missing or invalid auth token
   *   - 403: User lacks admin role
   *   - 409: Invoice already being processed or not in 'approved' status
   *   - 500: Payment processing failure
   */
  create: async (payload: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    try {
      const response = await api.post<CreatePaymentResponse>('/payments', payload);
      return response as unknown as CreatePaymentResponse;
    } catch (error: any) {
      // Parse error response and throw with specific message
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 400:
          throw new Error(message || 'Invalid payment request. Please refresh and try again.');
        case 401:
          throw new Error(message || 'Session expired. Please log in again.');
        case 403:
          throw new Error(message || "You don't have permission to process payments.");
        case 409:
          throw new Error(message || 'This invoice is already being processed.');
        case 500:
          throw new Error(message || 'Payment system unavailable. Please try again later.');
        default:
          throw new Error(message || 'An unexpected error occurred while processing the payment.');
      }
    }
  },
};
