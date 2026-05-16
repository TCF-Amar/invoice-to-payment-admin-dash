import api from './client';
import { StripePayoutStatus } from '@/types';

export interface CreatePayoutPayload {
  invoiceId: string;
  amount: number;
  vendorId: string;
}

export interface BulkPayoutItem {
  invoiceId: string;
  amount: number;
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

  createPayout: async (payload: CreatePayoutPayload) => {
    const response = await api.post('/payouts/trigger', payload);
    return response;
  },

  createBulkPayout: async (payouts: BulkPayoutItem[]) => {
    const response = await api.post('/payouts/trigger', payouts);
    return response;
  },
};
