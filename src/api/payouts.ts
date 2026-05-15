import api from './client';
import { StripePayoutStatus } from '@/types';

export interface StripePayoutPayload {
  vendorId: string;
  invoiceId: string;
  amount: number;
  currency: string;
}

export interface StripeBulkPayoutPayload {
  payouts: Array<{
    vendorId: string;
    invoiceId: string;
    amount: number;
  }>;
}

export const payoutService = {
  setupVendor: async (vendorId: string) => {
    const response = await api.post<{ accountId: string }>('/payouts/stripe/setup-vendor', {
      vendorId,
    });
    return response as unknown as { accountId: string };
  },

  getOnboardingLink: async (vendorId: string) => {
    const response = await api.get<{ url: string }>(`/payouts/stripe/onboarding-link/${vendorId}`);
    return response as unknown as { url: string };
  },

  getStatus: async (vendorId: string) => {
    const response = await api.get<StripePayoutStatus>(`/payouts/stripe/status/${vendorId}`);
    return response as unknown as StripePayoutStatus;
  },

  createPayout: async (payload: StripePayoutPayload) => {
    const response = await api.post('/payouts/stripe', payload);
    return response;
  },

  createBulkPayout: async (payload: StripeBulkPayoutPayload) => {
    const response = await api.post('/payouts/stripe/bulk', payload);
    return response;
  },
};
