import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import InvoiceDetail from './InvoiceDetail';
import type { Invoice, UserRole } from '@/types';

// Mock all the hooks and utilities
vi.mock('@/hooks/useInvoices', () => ({
  useInvoice: vi.fn(),
  useUpdateInvoiceStatus: vi.fn(),
}));

vi.mock('@/hooks/usePurchaseOrders', () => ({
  usePurchaseOrders: vi.fn(),
}));

vi.mock('@/hooks/useVendors', () => ({
  useVendors: vi.fn(),
}));

vi.mock('@/hooks/usePayments', () => ({
  useCreatePayment: vi.fn(),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/utils/formatCurrency', () => ({
  formatCurrency: (amount: number, currency: string) => `${currency === 'USD' ? '$' : currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
}));

vi.mock('@/utils/formatDate', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString('en-US'),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import mocked modules
import { useInvoice, useUpdateInvoiceStatus } from '@/hooks/useInvoices';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useVendors } from '@/hooks/useVendors';
import { useCreatePayment } from '@/hooks/usePayments';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

describe('InvoiceDetail - Payment Integration', () => {
  const mockApprovedInvoice: Invoice = {
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
    lineItems: [
      {
        description: 'Service A',
        qty: 2,
        unitPrice: 1000,
        total: 2000,
      },
      {
        description: 'Service B',
        qty: 3,
        unitPrice: 1000,
        total: 3000,
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
  };

  const mockPendingInvoice: Invoice = {
    ...mockApprovedInvoice,
    id: 'inv-456',
    invoiceNumber: 'INV-2024-002',
    status: 'processing',
  };

  const mockPaidInvoice: Invoice = {
    ...mockApprovedInvoice,
    id: 'inv-789',
    invoiceNumber: 'INV-2024-003',
    status: 'paid',
  };

  const mockUpdateStatusMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockCreatePaymentMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockFetchUserRole = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    (useVendors as any).mockReturnValue({
      data: { items: [] },
    });

    (usePurchaseOrders as any).mockReturnValue({
      data: { items: [] },
    });

    (useUpdateInvoiceStatus as any).mockReturnValue(mockUpdateStatusMutation);

    (useCreatePayment as any).mockReturnValue(mockCreatePaymentMutation);

    (useAuthStore as any).mockReturnValue({
      userRole: 'admin' as UserRole,
      fetchUserRole: mockFetchUserRole,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderInvoiceDetail = (invoice: Invoice | null, isLoading = false) => {
    (useInvoice as any).mockReturnValue({
      data: invoice,
      isLoading,
    });

    return render(
      <MemoryRouter initialEntries={[`/invoices/${invoice?.id || 'test-id'}`]}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Requirement 2.1: Payment button appears for approved invoices', () => {
    it('should display payment button when invoice status is approved', () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Look for the payment button by its test ID
      const paymentButton = screen.getByTestId('payment-button');
      expect(paymentButton).toBeInTheDocument();
    });

    it('should display payment button with correct amount for approved invoice', () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Payment button should show the amount
      expect(screen.getByText(/Pay \$5,000\.00/)).toBeInTheDocument();
    });

    it('should display payment actions section for approved invoice', () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Check for the Payment Actions section
      expect(screen.getByText('Payment Actions')).toBeInTheDocument();
      expect(screen.getByText('Process payment for this approved invoice')).toBeInTheDocument();
    });
  });

  describe('Requirement 2.2: Payment button does not appear for non-approved invoices', () => {
    it('should not display payment button when invoice status is processing', () => {
      renderInvoiceDetail(mockPendingInvoice);

      // Payment button should not be present
      const paymentButton = screen.queryByTestId('payment-button');
      expect(paymentButton).not.toBeInTheDocument();
    });

    it('should not display payment button when invoice status is paid', () => {
      renderInvoiceDetail(mockPaidInvoice);

      // Payment button should not be present
      const paymentButton = screen.queryByTestId('payment-button');
      expect(paymentButton).not.toBeInTheDocument();
    });

    it('should display manual review actions for non-approved invoice', () => {
      renderInvoiceDetail(mockPendingInvoice);

      // Should show approve/reject buttons instead
      expect(screen.getByText('Manual Review')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });

    it('should display status message for paid invoice', () => {
      renderInvoiceDetail(mockPaidInvoice);

      // Should show a message that invoice cannot be modified
      expect(screen.getByText(/This invoice cannot be modified in its current status/i)).toBeInTheDocument();
    });
  });

  describe('Requirement 4.1: Payment modal opens when payment button clicked', () => {
    it('should open payment confirmation modal when payment button is clicked', async () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Click the payment button
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
      });
    });

    it('should display invoice details in payment modal', async () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Click the payment button
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal and check invoice details
      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
        expect(screen.getByText('$5,000.00')).toBeInTheDocument();
      });
    });

    it('should display confirm and cancel buttons in modal', async () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Click the payment button
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal and check buttons
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('should close modal when cancel button is clicked', async () => {
      renderInvoiceDetail(mockApprovedInvoice);

      // Open modal
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Confirm Payment' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirement 7.6: Payment success updates invoice status', () => {
    it('should call payment mutation when confirm button is clicked', async () => {
      mockCreatePaymentMutation.mutateAsync.mockResolvedValue({
        paymentId: 'pay-123',
        invoiceId: 'inv-123',
        amount: 5000,
        currency: 'USD',
        status: 'completed',
        processedAt: '2024-01-15T12:00:00Z',
      });

      renderInvoiceDetail(mockApprovedInvoice);

      // Open modal
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal and click confirm
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
      fireEvent.click(confirmButton);

      // Verify payment mutation was called with correct parameters
      await waitFor(() => {
        expect(mockCreatePaymentMutation.mutateAsync).toHaveBeenCalledWith({
          invoiceId: 'inv-123',
          amount: 5000,
          currency: 'USD',
        });
      });
    });

    it('should close modal after successful payment', async () => {
      mockCreatePaymentMutation.mutateAsync.mockResolvedValue({
        paymentId: 'pay-123',
        invoiceId: 'inv-123',
        amount: 5000,
        currency: 'USD',
        status: 'completed',
        processedAt: '2024-01-15T12:00:00Z',
      });

      renderInvoiceDetail(mockApprovedInvoice);

      // Open modal
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal and click confirm
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
      fireEvent.click(confirmButton);

      // Modal should close after successful payment
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Confirm Payment' })).not.toBeInTheDocument();
      });
    });

    it('should keep modal open after failed payment', async () => {
      mockCreatePaymentMutation.mutateAsync.mockRejectedValue(new Error('Payment failed'));

      renderInvoiceDetail(mockApprovedInvoice);

      // Open modal
      const paymentButton = screen.getByTestId('payment-button');
      fireEvent.click(paymentButton);

      // Wait for modal and click confirm
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm payment/i });
      fireEvent.click(confirmButton);

      // Modal should remain open after failed payment
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Confirm Payment' })).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 7.6: Payment button disappears after successful payment', () => {
    it('should not display payment button after invoice status changes to paid', () => {
      // First render with approved invoice
      const { rerender } = renderInvoiceDetail(mockApprovedInvoice);

      // Verify payment button is present
      expect(screen.getByTestId('payment-button')).toBeInTheDocument();

      // Simulate invoice status update to paid
      (useInvoice as any).mockReturnValue({
        data: mockPaidInvoice,
        isLoading: false,
      });

      // Re-render with updated invoice
      rerender(
        <MemoryRouter initialEntries={[`/invoices/${mockPaidInvoice.id}`]}>
          <Routes>
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Payment button should no longer be present
      expect(screen.queryByTestId('payment-button')).not.toBeInTheDocument();
    });

    it('should display status message instead of payment button for paid invoice', () => {
      renderInvoiceDetail(mockPaidInvoice);

      // Should show status message
      expect(screen.getByText(/This invoice cannot be modified in its current status/i)).toBeInTheDocument();
      
      // Payment button should not be present
      expect(screen.queryByTestId('payment-button')).not.toBeInTheDocument();
    });
  });

  describe('User role integration', () => {
    it('should fetch user role on component mount', () => {
      renderInvoiceDetail(mockApprovedInvoice);

      expect(mockFetchUserRole).toHaveBeenCalled();
    });

    it('should pass user role to PaymentButton component', () => {
      (useAuthStore as any).mockReturnValue({
        userRole: 'standard' as UserRole,
        fetchUserRole: mockFetchUserRole,
      });

      renderInvoiceDetail(mockApprovedInvoice);

      // Payment button should be disabled for standard users
      const paymentButton = screen.getByTestId('payment-button');
      expect(paymentButton).toBeDisabled();
    });

    it('should enable payment button for admin users', () => {
      (useAuthStore as any).mockReturnValue({
        userRole: 'admin' as UserRole,
        fetchUserRole: mockFetchUserRole,
      });

      renderInvoiceDetail(mockApprovedInvoice);

      // Payment button should be enabled for admin users
      const paymentButton = screen.getByTestId('payment-button');
      expect(paymentButton).not.toBeDisabled();
    });
  });

  describe('Processing state', () => {
    it('should disable payment button while payment is processing', () => {
      (useCreatePayment as any).mockReturnValue({
        ...mockCreatePaymentMutation,
        isPending: true,
      });

      renderInvoiceDetail(mockApprovedInvoice);

      // Payment button should be disabled during processing
      const paymentButton = screen.getByTestId('payment-button');
      expect(paymentButton).toBeDisabled();
    });

    it('should show loading state in payment button while processing', () => {
      (useCreatePayment as any).mockReturnValue({
        ...mockCreatePaymentMutation,
        isPending: true,
      });

      renderInvoiceDetail(mockApprovedInvoice);

      // Check for loading spinner in button
      const paymentButton = screen.getByTestId('payment-button');
      const spinner = paymentButton.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle loading state', () => {
      renderInvoiceDetail(null, true);

      // Should show loading skeleton
      expect(screen.getByText('Invoice Details')).toBeInTheDocument();
    });

    it('should handle invoice not found', () => {
      renderInvoiceDetail(null, false);

      expect(screen.getByText('Invoice not found')).toBeInTheDocument();
    });

    it('should handle invoice without payment button when status is rejected', () => {
      const rejectedInvoice: Invoice = {
        ...mockApprovedInvoice,
        status: 'rejected',
        rejectionReason: 'Invalid PO number',
      };

      renderInvoiceDetail(rejectedInvoice);

      // Payment button should not be present
      expect(screen.queryByTestId('payment-button')).not.toBeInTheDocument();
      
      // Should show rejection reason
      expect(screen.getByText('Invalid PO number')).toBeInTheDocument();
    });

    it('should handle different currencies in payment button', () => {
      const euroInvoice: Invoice = {
        ...mockApprovedInvoice,
        currency: 'EUR',
        amountDue: 3500,
      };

      renderInvoiceDetail(euroInvoice);

      // Payment button should show EUR currency
      expect(screen.getByText(/Pay EUR3,500\.00/)).toBeInTheDocument();
    });
  });
});
