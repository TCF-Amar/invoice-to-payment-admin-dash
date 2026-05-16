import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from './payments';
import api from './client';
import { CreatePaymentRequest } from '@/types';

// Mock the API client
vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Payment API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('paymentService.create', () => {
    const mockPayload: CreatePaymentRequest = {
      invoiceId: 'inv-123',
      amount: 1000.0,
      currency: 'USD',
    };

    it('should successfully create a payment', async () => {
      const mockResponse = {
        paymentId: 'pay-456',
        invoiceId: 'inv-123',
        amount: 1000.0,
        currency: 'USD',
        status: 'completed' as const,
        transactionId: 'txn-789',
        processedAt: '2024-01-15T10:30:00Z',
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await paymentService.create(mockPayload);

      expect(api.post).toHaveBeenCalledWith('/payments', mockPayload);
      expect(result).toEqual(mockResponse);
    });

    it('should throw specific error for 400 Bad Request', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid invoice ID' },
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow('Invalid invoice ID');
    });

    it('should throw default error message for 400 without custom message', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {},
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'Invalid payment request. Please refresh and try again.'
      );
    });

    it('should throw specific error for 401 Unauthorized', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow('Token expired');
    });

    it('should throw default error message for 401 without custom message', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {},
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'Session expired. Please log in again.'
      );
    });

    it('should throw specific error for 403 Forbidden', async () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Admin role required' },
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow('Admin role required');
    });

    it('should throw default error message for 403 without custom message', async () => {
      const mockError = {
        response: {
          status: 403,
          data: {},
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        "You don't have permission to process payments."
      );
    });

    it('should throw specific error for 409 Conflict', async () => {
      const mockError = {
        response: {
          status: 409,
          data: { message: 'Invoice is not in approved status' },
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'Invoice is not in approved status'
      );
    });

    it('should throw default error message for 409 without custom message', async () => {
      const mockError = {
        response: {
          status: 409,
          data: {},
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'This invoice is already being processed.'
      );
    });

    it('should throw specific error for 500 Internal Server Error', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Database connection failed' },
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow('Database connection failed');
    });

    it('should throw default error message for 500 without custom message', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {},
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'Payment system unavailable. Please try again later.'
      );
    });

    it('should throw generic error for unknown status codes', async () => {
      const mockError = {
        response: {
          status: 503,
          data: { message: 'Service temporarily unavailable' },
        },
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'Service temporarily unavailable'
      );
    });

    it('should throw generic error for network errors without response', async () => {
      const mockError = {
        message: 'Network error',
      };

      (api.post as any).mockRejectedValue(mockError);

      await expect(paymentService.create(mockPayload)).rejects.toThrow(
        'An unexpected error occurred while processing the payment.'
      );
    });
  });
});
