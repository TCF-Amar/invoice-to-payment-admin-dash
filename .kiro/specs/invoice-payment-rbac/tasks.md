# Implementation Plan: Invoice Payment RBAC

## Overview

This implementation plan adds role-based access control (RBAC) for invoice payment functionality to the existing invoice portal. The feature enables authorized admin users to initiate direct payments for approved invoices through a secure, auditable workflow. Standard users can view invoices but cannot process payments. The implementation integrates seamlessly with the existing React + TypeScript frontend, Zustand state management, and React Query data fetching patterns.

## Tasks

- [x] 1. Set up authentication and authorization infrastructure
  - [x] 1.1 Create AuthStore with Zustand for user role management
    - Create `src/store/useAuthStore.ts` with state for userId, userEmail, userRole, roleLoadedAt, isLoadingRole, roleError
    - Implement `fetchUserRole()` action that calls auth API and caches result for 5 minutes
    - Implement `setUserRole()` action that updates state and localStorage
    - Implement `clearAuth()` action for logout
    - Add localStorage persistence with 5-minute TTL for role caching
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 1.2 Create auth API client
    - Create `src/api/auth.ts` with `getAuthMe()` function
    - Define `AuthMeResponse` interface with userId, email, role, permissions, createdAt
    - Configure endpoint as `GET /api/v1/auth/me` with Authorization header
    - Add error handling for 401 Unauthorized responses
    - _Requirements: 3.1, 3.2_
  
  - [x] 1.3 Add user role types to type definitions
    - Update `src/types/index.ts` to add `UserRole` type ('admin' | 'standard')
    - Add `AuthState` interface for Zustand store
    - Add `AuthMeResponse` interface for API response
    - _Requirements: 3.1_

- [x] 2. Implement payment transaction data models and API
  - [x] 2.1 Add payment-related type definitions
    - Update `src/types/index.ts` to add `PaymentTransaction` interface
    - Add `PaymentLock` interface for concurrent payment prevention
    - Add `PaymentAuditLog` interface for audit trail
    - Add `CreatePaymentRequest` and `CreatePaymentResponse` interfaces
    - _Requirements: 4.5, 4.6, 8.1, 9.1_
  
  - [x] 2.2 Create payment API client
    - Create `src/api/payments.ts` with `createPayment()` function
    - Implement `POST /api/v1/payments` endpoint call
    - Add error handling for 400, 401, 403, 409, 500 status codes
    - Parse and return specific error messages for each error type
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 2.3 Create payment React Query hook
    - Create `src/hooks/usePayments.ts` with `useCreatePayment` mutation hook
    - Configure mutation to invalidate invoice queries on success
    - Add optimistic updates for invoice status
    - Handle error states and display appropriate toast notifications
    - _Requirements: 4.2, 7.1, 7.2_

- [x] 3. Build payment confirmation modal component
  - [x] 3.1 Create PaymentConfirmationModal component
    - Create `src/components/ui/PaymentConfirmationModal.tsx`
    - Accept props: isOpen, invoice, onClose, onConfirm, isProcessing
    - Display invoice number (large, prominent), vendor name, payment amount (formatted)
    - Add warning text: "This action cannot be undone"
    - Include Cancel button (secondary) and Confirm button (primary)
    - Disable confirm button while processing and show loading spinner
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 3.2 Write unit tests for PaymentConfirmationModal
    - Test modal renders with correct invoice details
    - Test cancel button closes modal without calling onConfirm
    - Test confirm button calls onConfirm with invoice ID
    - Test confirm button is disabled during processing
    - Test loading spinner appears during processing
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 4. Create payment button component with role-based access control
  - [x] 4.1 Create PaymentButton component
    - Create `src/components/ui/PaymentButton.tsx`
    - Accept props: invoice, userRole, onClick, isProcessing
    - Return null if invoice status is not 'approved'
    - Render enabled button for admin users, disabled button for standard users
    - Display payment amount in button text using formatCurrency utility
    - Add tooltip: "Admin privileges required" for standard users, "Payment in progress..." when processing
    - Show loading spinner icon when isProcessing is true
    - _Requirements: 2.1, 2.2, 2.4, 4.1, 5.1, 5.2, 5.3_
  
  - [x] 4.2 Write property test for PaymentButton conditional rendering
    - **Property 2: Pay Button Conditional Rendering**
    - **Validates: Requirements 2.1, 2.2**
    - Use fast-check to generate random invoices with varying statuses
    - Verify button is displayed if and only if status is 'approved'
    - Test with 100+ random invoice combinations
    - _Requirements: 2.1, 2.2_
  
  - [x] 4.3 Write property test for PaymentButton role-based state
    - **Property 4: Role-Based Button State**
    - **Validates: Requirements 4.1, 5.1**
    - Use fast-check to generate random user roles and approved invoices
    - Verify button is enabled for admin, disabled for standard users
    - Test with 100+ random role/invoice combinations
    - _Requirements: 4.1, 5.1_
  
  - [x] 4.4 Write unit tests for PaymentButton
    - Test button displays correct payment amount
    - Test tooltip text for standard users
    - Test loading state during processing
    - Test onClick handler is called for admin users
    - Test onClick handler is not called for standard users
    - _Requirements: 2.4, 5.3, 5.4, 5.5_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Enhance InvoiceList component with payment functionality
  - [x] 6.1 Update InvoiceList to integrate payment features
    - Update `src/pages/invoices/InvoiceList.tsx` to fetch user role from AuthStore
    - Add state for selectedInvoiceForPayment, showPaymentModal, processingPaymentId
    - Add PaymentButton component to each invoice row in the table
    - Implement handlePaymentClick to open confirmation modal
    - Implement handlePaymentConfirm to call payment mutation
    - Handle payment success: show toast, refresh invoice data, close modal
    - Handle payment error: show error toast with specific message, keep modal open
    - _Requirements: 1.1, 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.4, 5.5, 7.1, 7.2, 7.5, 7.6_
  
  - [-] 6.2 Write property test for invoice table field completeness
    - **Property 1: Invoice Table Field Completeness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
    - Use fast-check to generate random invoice lists
    - Verify all required fields are displayed for each invoice
    - Test with varying invoice data (nulls, large amounts, edge cases)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [-] 6.3 Write unit tests for InvoiceList payment integration
    - Test empty state displays when no invoices
    - Test payment button appears only for approved invoices
    - Test payment modal opens when payment button clicked
    - Test payment modal closes on cancel
    - Test success notification appears after successful payment
    - Test error notification appears after failed payment
    - _Requirements: 1.9, 2.1, 6.1, 6.4, 7.1, 7.2_

- [ ] 7. Enhance InvoiceDetail component with payment functionality
  - [x] 7.1 Update InvoiceDetail to integrate payment features
    - Update `src/pages/invoices/InvoiceDetail.tsx` to fetch user role from AuthStore
    - Add state for showPaymentModal, isProcessingPayment
    - Add PaymentButton component to invoice detail header/actions area
    - Implement handlePaymentClick to open confirmation modal
    - Implement handlePaymentConfirm to call payment mutation
    - Handle payment success: show toast, refresh invoice data, close modal
    - Handle payment error: show error toast with specific message, keep modal open
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 7.1, 7.2, 7.5, 7.6_
  
  - [-] 7.2 Write unit tests for InvoiceDetail payment integration
    - Test payment button appears for approved invoices
    - Test payment button does not appear for non-approved invoices
    - Test payment modal opens when payment button clicked
    - Test payment success updates invoice status
    - Test payment button disappears after successful payment
    - _Requirements: 2.1, 2.2, 4.1, 7.6_

- [ ] 8. Implement concurrent payment prevention
  - [x] 8.1 Add payment lock state management
    - Update payment API client to handle 409 Conflict responses
    - Add specific error message for concurrent payment attempts
    - Implement automatic invoice data refresh after 5 seconds on 409 error
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [-] 8.2 Write property test for concurrent payment prevention
    - **Property 13: Concurrent Payment Prevention**
    - **Validates: Requirements 8.1, 8.2**
    - Simulate multiple simultaneous payment requests for same invoice
    - Verify second request is rejected with 409 status
    - Verify appropriate error message is displayed
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [-] 8.3 Write unit tests for payment lock handling
    - Test 409 error displays "already being processed" message
    - Test invoice data refreshes after 5 seconds on 409 error
    - Test UI updates when processing completes
    - _Requirements: 8.3_

- [ ] 9. Implement pagination for invoice table
  - [-] 9.1 Add pagination controls to InvoiceList
    - Update `src/pages/invoices/InvoiceList.tsx` to implement pagination
    - Set page size limit to 50 invoices per page
    - Add pagination controls (previous, next, page numbers)
    - Update invoice query to use page and limit parameters
    - Show loading indicator while invoice data is loading
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [~] 9.2 Write property test for pagination limit
    - **Property 21: Pagination Limit**
    - **Validates: Requirements 10.3**
    - Generate invoice lists of varying sizes (0, 50, 100, 150, 200)
    - Verify maximum 50 invoices displayed per page
    - Test pagination controls appear when needed
    - _Requirements: 10.3, 10.4_
  
  - [~] 9.3 Write unit tests for pagination
    - Test pagination controls appear for 100+ invoices
    - Test pagination controls do not appear for <100 invoices
    - Test page navigation updates displayed invoices
    - Test loading indicator appears during data fetch
    - _Requirements: 10.2, 10.4, 10.5_

- [~] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement table sorting functionality
  - [~] 11.1 Add sorting to InvoiceList table
    - Update `src/pages/invoices/InvoiceList.tsx` to add sortable columns
    - Implement sorting for invoice number, vendor name, total amount, invoice date, due date
    - Add sort direction indicators (ascending/descending arrows)
    - Update invoice query to use sort field and direction parameters
    - Persist sort preferences in useFilterStore
    - _Requirements: 1.10_
  
  - [~] 11.2 Write property test for table sorting correctness
    - **Property 24: Table Sorting Correctness**
    - **Validates: Requirements 1.10**
    - Generate random invoice lists with varying field values
    - Test sorting by each sortable field (number, name, amount, dates)
    - Verify correct ascending and descending order
    - Test with edge cases (nulls, equal values, special characters)
    - _Requirements: 1.10_

- [ ] 12. Implement error handling and user feedback
  - [~] 12.1 Add comprehensive error handling to payment flow
    - Implement authorization error handling (display error toast, disable buttons, retry logic)
    - Implement payment initiation error handling (parse error codes, display specific messages)
    - Implement network timeout handling (progressive messaging, status polling)
    - Add error logging to console for debugging
    - _Requirements: 4.4, 7.2, 7.4_
  
  - [~] 12.2 Write property test for error notification completeness
    - **Property 17: Error Notification Completeness**
    - **Validates: Requirements 7.2, 7.4**
    - Generate random payment failure scenarios
    - Verify error notification includes failure reason
    - Verify error notification remains visible until dismissed
    - Test with various error types (400, 401, 403, 409, 500)
    - _Requirements: 7.2, 7.4_
  
  - [~] 12.3 Write unit tests for error handling
    - Test 400 error displays "Invalid payment request" message
    - Test 401 error displays "Session expired" message
    - Test 403 error displays "You don't have permission" message
    - Test 409 error displays "Already being processed" message
    - Test 500 error displays "Payment system unavailable" message
    - Test network timeout displays progressive messages
    - _Requirements: 4.4, 7.2_

- [ ] 13. Implement success notifications and UI updates
  - [~] 13.1 Add success notification handling
    - Implement success toast notification with invoice number and payment amount
    - Implement automatic invoice data refresh within 2 seconds after payment
    - Implement payment button removal after successful payment
    - _Requirements: 7.1, 7.3, 7.5, 7.6_
  
  - [~] 13.2 Write property test for success notification completeness
    - **Property 16: Success Notification Completeness**
    - **Validates: Requirements 7.1, 7.3**
    - Generate random successful payment scenarios
    - Verify success notification includes invoice number and amount
    - Verify notification is displayed immediately after success
    - _Requirements: 7.1, 7.3_
  
  - [~] 13.3 Write property test for payment success UI update
    - **Property 18: Payment Success UI Update**
    - **Validates: Requirements 7.6**
    - Test that pay button is removed after successful payment
    - Verify invoice status updates to 'paid'
    - Test with multiple invoices to ensure only paid invoice is updated
    - _Requirements: 7.6_

- [ ] 14. Add authorization checks to app initialization
  - [~] 14.1 Initialize auth state on app load
    - Update `src/App.tsx` to fetch user role on mount
    - Add loading state while role is being fetched
    - Handle auth errors gracefully (show error banner, allow read-only access)
    - Implement retry logic for failed auth requests (max 3 retries)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [~] 14.2 Write property test for authorization role consistency
    - **Property 20: Authorization Role Consistency**
    - **Validates: Requirements 3.3**
    - Simulate multiple auth requests within same session
    - Verify all requests return same role value
    - Test with role caching (5-minute TTL)
    - _Requirements: 3.3_

- [~] 15. Final checkpoint - Integration testing and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The implementation integrates with existing components (InvoiceList, InvoiceDetail) and patterns (Zustand, React Query, Axios)
- All TypeScript interfaces and types should be added to `src/types/index.ts` for consistency
- Follow existing project conventions for component structure, styling (Tailwind CSS), and state management
- Use existing UI components (Button, Modal, Badge) from `src/components/ui/` where possible
- Payment functionality is frontend-only; backend API endpoints are assumed to exist per the design document

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "4.2", "4.3", "4.4"] },
    { "id": 3, "tasks": ["6.1", "7.1", "8.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7.2", "8.2", "8.3", "9.1"] },
    { "id": 5, "tasks": ["9.2", "9.3", "11.1"] },
    { "id": 6, "tasks": ["11.2", "12.1"] },
    { "id": 7, "tasks": ["12.2", "12.3", "13.1"] },
    { "id": 8, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 9, "tasks": ["14.2"] }
  ]
}
```
