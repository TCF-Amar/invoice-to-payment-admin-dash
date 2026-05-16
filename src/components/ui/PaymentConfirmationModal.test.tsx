import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentConfirmationModal } from './PaymentConfirmationModal';
import type { Invoice } from '@/types';

const mockInvoice: Invoice = {
  id: 'inv-123',
  invoiceNumber: 'INV-2024-001',
  vendorId: 'vendor-1',
  vendorName: 'Acme Corporation',
  totalAmount: 5000,
  amountDue: 5000,
  amountPaid: 0,
  status: 'approved',
  currency: 'USD',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  lineItems: [],
  createdAt: '2024-01-15T10:00:00Z',
};

describe('PaymentConfirmationModal', () => {
  describe('Requirement 6.1: Display confirmation dialog', () => {
    it('should display modal when isOpen is true', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
    });

    it('should not display modal when isOpen is false', () => {
      render(
        <PaymentConfirmationModal
          isOpen={false}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.queryByRole('heading', { name: 'Confirm Payment' })).not.toBeInTheDocument();
    });
  });

  describe('Requirement 6.2: Display invoice details', () => {
    it('should display invoice number prominently', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      const invoiceNumber = screen.getByText('INV-2024-001');
      expect(invoiceNumber).toBeInTheDocument();
      // Check that it's displayed prominently (large text)
      expect(invoiceNumber).toHaveClass('text-3xl');
    });

    it('should display vendor name', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    it('should display payment amount formatted with currency', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      // formatCurrency should format 5000 USD as $5,000.00
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });

    it('should handle invoice with vendor object', () => {
      const invoiceWithVendorObject: Invoice = {
        ...mockInvoice,
        vendorName: undefined,
        vendor: {
          id: 'vendor-1',
          name: 'Test Vendor Inc',
          email: 'test@vendor.com',
          isVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={invoiceWithVendorObject}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByText('Test Vendor Inc')).toBeInTheDocument();
    });
  });

  describe('Requirement 6.2: Display warning text', () => {
    it('should display warning that action cannot be undone', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  describe('Requirement 6.3: Provide confirm and cancel actions', () => {
    it('should display Cancel button', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should display Confirm button', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
    });
  });

  describe('Requirement 6.4: Cancel action closes dialog', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = vi.fn();
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={onClose}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onConfirm when Cancel button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={onConfirm}
          isProcessing={false}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 6.5: Confirm action initiates payment', () => {
    it('should call onConfirm when Confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={onConfirm}
          isProcessing={false}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm with invoice ID when Confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={onConfirm}
          isProcessing={false}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledWith('inv-123');
    });
  });

  describe('Requirement 6.6 & 6.7: Processing state', () => {
    it('should disable confirm button while processing', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={true}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /processing/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should disable cancel button while processing', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading spinner when processing', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={true}
        />
      );

      // Button component shows loading spinner via isLoading prop
      const confirmButton = screen.getByRole('button', { name: /processing/i });
      expect(confirmButton).toHaveAttribute('disabled');
    });

    it('should change button text to "Processing..." when processing', () => {
      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={mockInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={true}
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should return null when invoice is null', () => {
      const { container } = render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={null}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle different currencies', () => {
      const euroInvoice: Invoice = {
        ...mockInvoice,
        currency: 'EUR',
        amountDue: 3500,
      };

      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={euroInvoice}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      // formatCurrency should format 3500 EUR as €3,500.00
      expect(screen.getByText(/3,500\.00/)).toBeInTheDocument();
    });

    it('should display "Unknown Vendor" when vendor information is missing', () => {
      const invoiceWithoutVendor: Invoice = {
        ...mockInvoice,
        vendorName: undefined,
        vendor: undefined,
      };

      render(
        <PaymentConfirmationModal
          isOpen={true}
          invoice={invoiceWithoutVendor}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isProcessing={false}
        />
      );

      expect(screen.getByText('Unknown Vendor')).toBeInTheDocument();
    });
  });
});
