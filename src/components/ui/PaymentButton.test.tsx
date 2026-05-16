import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentButton } from './PaymentButton';
import type { Invoice, UserRole } from '@/types';
import fc from 'fast-check';

// Mock formatCurrency utility
vi.mock('@/utils/formatCurrency', () => ({
  formatCurrency: (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`,
}));

describe('PaymentButton', () => {
  const mockInvoice: Invoice = {
    id: '1',
    invoiceNumber: 'INV-001',
    vendorId: 'vendor-1',
    vendorName: 'Test Vendor',
    totalAmount: 1000,
    amountDue: 1000,
    amountPaid: 0,
    status: 'approved',
    currency: 'USD',
    lineItems: [],
    createdAt: '2024-01-01',
  };

  const mockOnClick = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility based on invoice status', () => {
    it('should render button when invoice status is approved', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByTestId('payment-button')).toBeInTheDocument();
    });

    it('should return null when invoice status is not approved', () => {
      const nonApprovedInvoice = { ...mockInvoice, status: 'processing' as const };
      
      const { container } = render(
        <PaymentButton
          invoice={nonApprovedInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null for rejected invoice', () => {
      const rejectedInvoice = { ...mockInvoice, status: 'rejected' as const };
      
      const { container } = render(
        <PaymentButton
          invoice={rejectedInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null for paid invoice', () => {
      const paidInvoice = { ...mockInvoice, status: 'paid' as const };
      
      const { container } = render(
        <PaymentButton
          invoice={paidInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Button state based on user role', () => {
    it('should render enabled button for admin users', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      const button = screen.getByTestId('payment-button');
      expect(button).not.toBeDisabled();
    });

    it('should render disabled button for standard users', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="standard"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      const button = screen.getByTestId('payment-button');
      expect(button).toBeDisabled();
    });

    it('should render disabled button when userRole is null', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole={null}
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      const button = screen.getByTestId('payment-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Payment amount display', () => {
    it('should display payment amount in button text using formatCurrency', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByText(/Pay USD 1000\.00/)).toBeInTheDocument();
    });

    it('should display correct amount for different currencies', () => {
      const euroInvoice = { ...mockInvoice, currency: 'EUR', amountDue: 500 };
      
      render(
        <PaymentButton
          invoice={euroInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByText(/Pay EUR 500\.00/)).toBeInTheDocument();
    });
  });

  describe('Processing state', () => {
    it('should show loading spinner when isProcessing is true', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={true}
        />
      );

      // Check for Loader2 icon (spinner)
      const button = screen.getByTestId('payment-button');
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable button when isProcessing is true', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={true}
        />
      );

      const button = screen.getByTestId('payment-button');
      expect(button).toBeDisabled();
    });

    it('should show DollarSign icon when not processing', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      const button = screen.getByTestId('payment-button');
      // DollarSign icon should be present (not spinner)
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Click handler', () => {
    it('should call onClick when admin clicks enabled button', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      const button = screen.getByTestId('payment-button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when standard user clicks disabled button', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="standard"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      const button = screen.getByTestId('payment-button');
      fireEvent.click(button);

      // Disabled buttons don't trigger click events
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when button is processing', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={true}
        />
      );

      const button = screen.getByTestId('payment-button');
      fireEvent.click(button);

      // Disabled buttons don't trigger click events
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Tooltip display', () => {
    it('should show "Admin privileges required" tooltip for standard users', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="standard"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByText('Admin privileges required')).toBeInTheDocument();
    });

    it('should show "Payment in progress..." tooltip when processing', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={true}
        />
      );

      expect(screen.getByText('Payment in progress...')).toBeInTheDocument();
    });

    it('should show default tooltip for admin users when not processing', () => {
      render(
        <PaymentButton
          invoice={mockInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByText('Click to pay this invoice')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero amount due', () => {
      const zeroAmountInvoice = { ...mockInvoice, amountDue: 0 };
      
      render(
        <PaymentButton
          invoice={zeroAmountInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByText(/Pay USD 0\.00/)).toBeInTheDocument();
    });

    it('should handle large amounts', () => {
      const largeAmountInvoice = { ...mockInvoice, amountDue: 999999.99 };
      
      render(
        <PaymentButton
          invoice={largeAmountInvoice}
          userRole="admin"
          onClick={mockOnClick}
          isProcessing={false}
        />
      );

      expect(screen.getByText(/Pay USD 999999\.99/)).toBeInTheDocument();
    });
  });

  // Property-Based Tests
  describe('Property 4: Role-Based Button State', () => {
    /**
     * **Validates: Requirements 4.1, 5.1**
     * 
     * Property: For any approved invoice and any user role, the Direct_Pay_Button 
     * SHALL be enabled if the user role is 'admin' and disabled if the user role 
     * is 'standard' or null.
     * 
     * This property test generates random combinations of:
     * - User roles (admin, standard, null)
     * - Approved invoices with varying amounts and currencies
     * 
     * And verifies that the button state is always correct based on the user role.
     */
    it('button is enabled for admin and disabled for standard users across 100+ random combinations', () => {
      // Define arbitraries for generating random test data
      const userRoleArbitrary = fc.oneof(
        fc.constant('admin' as UserRole),
        fc.constant('standard' as UserRole),
        fc.constant(null)
      );

      const approvedInvoiceArbitrary = fc.record({
        id: fc.uuid(),
        invoiceNumber: fc.string({ minLength: 5, maxLength: 20 }),
        vendorId: fc.uuid(),
        vendorName: fc.string({ minLength: 3, maxLength: 50 }),
        totalAmount: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        amountDue: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        amountPaid: fc.double({ min: 0, max: 1000000, noNaN: true }),
        status: fc.constant('approved' as const),
        currency: fc.oneof(
          fc.constant('USD'),
          fc.constant('EUR'),
          fc.constant('GBP'),
          fc.constant('INR')
        ),
        lineItems: fc.constant([] as []),
        createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      }) as fc.Arbitrary<Invoice>;

      // Run the property test
      fc.assert(
        fc.property(
          userRoleArbitrary,
          approvedInvoiceArbitrary,
          (userRole, invoice) => {
            const localMockOnClick = vi.fn();
            
            // Render the PaymentButton with the generated data
            const { container } = render(
              <PaymentButton
                invoice={invoice}
                userRole={userRole}
                onClick={localMockOnClick}
                isProcessing={false}
              />
            );

            // Find the button element
            const button = container.querySelector('[data-testid="payment-button"]') as HTMLButtonElement;

            // Verify the button is rendered (since invoice is approved)
            expect(button).not.toBeNull();

            // Property assertion: Button state based on user role
            if (userRole === 'admin') {
              // Admin users should have enabled button
              expect(button.disabled).toBe(false);
            } else {
              // Standard users and null role should have disabled button
              expect(button.disabled).toBe(true);
            }

            // Cleanup after each iteration
            container.remove();
          }
        ),
        { numRuns: 100 } // Run 100+ iterations as specified in the task
      );
    });

    it('button state is consistent when processing flag is combined with user role', () => {
      // Test that processing state always disables the button regardless of role
      const userRoleArbitrary = fc.oneof(
        fc.constant('admin' as UserRole),
        fc.constant('standard' as UserRole),
        fc.constant(null)
      );

      const approvedInvoiceArbitrary = fc.record({
        id: fc.uuid(),
        invoiceNumber: fc.string({ minLength: 5, maxLength: 20 }),
        vendorId: fc.uuid(),
        vendorName: fc.string({ minLength: 3, maxLength: 50 }),
        totalAmount: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        amountDue: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        amountPaid: fc.double({ min: 0, max: 1000000, noNaN: true }),
        status: fc.constant('approved' as const),
        currency: fc.constant('USD'),
        lineItems: fc.constant([] as []),
        createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      }) as fc.Arbitrary<Invoice>;

      const isProcessingArbitrary = fc.boolean();

      fc.assert(
        fc.property(
          userRoleArbitrary,
          approvedInvoiceArbitrary,
          isProcessingArbitrary,
          (userRole, invoice, isProcessing) => {
            const localMockOnClick = vi.fn();
            
            const { container } = render(
              <PaymentButton
                invoice={invoice}
                userRole={userRole}
                onClick={localMockOnClick}
                isProcessing={isProcessing}
              />
            );

            const button = container.querySelector('[data-testid="payment-button"]') as HTMLButtonElement;
            expect(button).not.toBeNull();

            // Property: Button is disabled if processing OR if user is not admin
            const shouldBeDisabled = isProcessing || userRole !== 'admin';
            expect(button.disabled).toBe(shouldBeDisabled);

            // Cleanup
            container.remove();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('button displays correct amount for any approved invoice with valid currency', () => {
      // Property: Button always displays the correct amount from the invoice
      const approvedInvoiceArbitrary = fc.record({
        id: fc.uuid(),
        invoiceNumber: fc.string({ minLength: 5, maxLength: 20 }),
        vendorId: fc.uuid(),
        vendorName: fc.string({ minLength: 3, maxLength: 50 }),
        totalAmount: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        amountDue: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        amountPaid: fc.double({ min: 0, max: 1000000, noNaN: true }),
        status: fc.constant('approved' as const),
        currency: fc.oneof(
          fc.constant('USD'),
          fc.constant('EUR'),
          fc.constant('GBP')
        ),
        lineItems: fc.constant([] as []),
        createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      }) as fc.Arbitrary<Invoice>;

      fc.assert(
        fc.property(
          approvedInvoiceArbitrary,
          (invoice) => {
            const localMockOnClick = vi.fn();
            
            const { container } = render(
              <PaymentButton
                invoice={invoice}
                userRole="admin"
                onClick={localMockOnClick}
                isProcessing={false}
              />
            );

            const button = container.querySelector('[data-testid="payment-button"]') as HTMLButtonElement;
            expect(button).not.toBeNull();

            // Property: Button text contains the formatted amount
            // Using the mocked formatCurrency: `${currency} ${amount.toFixed(2)}`
            const expectedText = `Pay ${invoice.currency} ${invoice.amountDue.toFixed(2)}`;
            expect(button.textContent).toContain(expectedText);

            // Cleanup
            container.remove();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
