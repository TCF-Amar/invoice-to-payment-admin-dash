import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Invoice } from '@/types';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onConfirm: (invoiceId: string) => void;
  isProcessing: boolean;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Confirm Payment</h2>
          <p className="text-sm text-slate-400">Review the payment details before proceeding</p>
        </div>

        {/* Invoice Details */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-white/5">
          {/* Invoice Number - Large and Prominent */}
          <div className="text-center pb-4 border-b border-white/5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Invoice Number</p>
            <p className="text-3xl font-bold text-indigo-400">{invoice.invoiceNumber}</p>
          </div>

          {/* Vendor Name */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Vendor</span>
            <span className="text-base font-semibold text-slate-100">
              {invoice.vendorName || invoice.vendor?.name || 'Unknown Vendor'}
            </span>
          </div>

          {/* Payment Amount - Formatted */}
          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-sm text-slate-400">Payment Amount</span>
            <span className="text-2xl font-bold text-green-400">
              {formatCurrency(invoice.amountDue, invoice.currency)}
            </span>
          </div>
        </div>

        {/* Warning Message */}
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-200">Warning</p>
            <p className="text-sm text-amber-300/80 mt-1">This action cannot be undone</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onConfirm(invoice.id)}
            disabled={isProcessing}
            isLoading={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
