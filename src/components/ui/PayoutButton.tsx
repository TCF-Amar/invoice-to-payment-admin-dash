import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Invoice } from '@/types';

interface PayoutButtonProps {
  invoice: Invoice;
  onClick: () => void;
  isProcessing: boolean;
}

/**
 * Triggers a Stripe vendor payout for a given invoice.
 * Visible only on invoices that have been paid or approved (eligible for vendor payout).
 */
export const PayoutButton: React.FC<PayoutButtonProps> = ({
  invoice,
  onClick,
  isProcessing,
}) => {
  // Only show payout option for invoices that have funds to settle to a vendor
  const eligibleStatuses: Invoice['status'][] = ['approved', 'paid'];
  if (!eligibleStatuses.includes(invoice.status)) {
    return null;
  }

  const isDisabled = isProcessing;
  const tooltip = isProcessing
    ? 'Payout in progress...'
    : 'Send payout to vendor via Stripe';

  return (
    <div className="relative group">
      <Button
        variant="secondary"
        size="sm"
        disabled={isDisabled}
        onClick={onClick}
        className="min-w-[120px]"
        data-testid="payout-button"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Payout {formatCurrency(invoice.amountDue || invoice.totalAmount, invoice.currency)}
      </Button>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg border border-slate-700">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
};
