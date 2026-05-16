import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payoutService, CreatePayoutPayload, BulkPayoutItem } from '@/api/payouts';
import toast from 'react-hot-toast';

export const useStripeStatus = (vendorId: string) => {
  return useQuery({
    queryKey: ['stripe-status', vendorId],
    queryFn: () => payoutService.getStatus(vendorId),
    enabled: !!vendorId,
  });
};

export const useSetupStripeVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => payoutService.setupVendor(vendorId),
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: ['stripe-status', vendorId] });
      toast.success('Stripe account setup initiated');
    },
    onError: () => {
      toast.error('Failed to setup Stripe account');
    },
  });
};

export const useGetOnboardingLink = () => {
  return useMutation({
    mutationFn: (vendorId: string) => payoutService.getOnboardingLink(vendorId),
    onError: () => {
      toast.error('Failed to get onboarding link');
    },
  });
};

export const useCreatePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayoutPayload) => payoutService.createPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-approved-unpaid'] });
      toast.success('Payout created successfully');
    },
    onError: () => {
      toast.error('Failed to create payout');
    },
  });
};

export const useCreateBulkPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payouts: BulkPayoutItem[]) => payoutService.createBulkPayout(payouts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-approved-unpaid'] });
      toast.success('Bulk payout created successfully');
    },
    onError: () => {
      toast.error('Failed to create bulk payout');
    },
  });
};
