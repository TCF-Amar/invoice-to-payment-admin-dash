import React from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Invoice, UserRole } from '@/types';

interface PaymentButtonProps {
  invoice: Invoice;
  userRole: UserRole | null;
  onClick: () => void;
  isProcessing: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  invoice,
  userRole,
  onClick,
  isProcessing,
}) => {
  // Return null if invoice status is not 'approved'
  if (invoice.status !== 'approved') {
    return null;
  }

  // Determine if button should be disabled
  const isDisabled = userRole !== 'admin' || isProcessing;

  // Determine tooltip text
  const getTooltipText = () => {
    if (userRole === 'standard') {
      return 'Admin privileges required';
    }
    if (isProcessing) {
      return 'Payment in progress...';
    }
    return 'Click to pay this invoice';
  };

  return (
    <div className="relative group">
      <Button
        variant="primary"
        size="sm"
        disabled={isDisabled}
        onClick={onClick}
        className="min-w-[120px]"
        data-testid="payment-button"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <DollarSign className="h-4 w-4" />
        )}
        Pay {formatCurrency(invoice.amountDue, invoice.currency)}
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg border border-slate-700">
        {getTooltipText()}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
};
