# Implementation Plan: PO-Based Invoice Upload Workflow

## Overview

This implementation plan converts the invoice upload functionality from the Invoice page to Purchase Order (PO) detail pages. The workflow enables administrators to generate secure upload links for vendors directly within delivered POs, streamlining invoice submission. The implementation follows a DAG-based structure allowing parallel execution where dependencies permit.

**Key Implementation Phases:**
1. **Preparation**: Set up types, API methods, and utilities
2. **Component Development**: Create InvoiceUploadManager and sub-components
3. **Integration**: Wire components into PODetail page
4. **Cleanup**: Remove old UploadLinkGenerator from Invoice page
5. **Testing**: Unit, integration, and property-based tests
6. **Verification**: Manual testing and validation

---

## Task Dependency Graph

```
PREPARATION PHASE (Tasks 1-3)
├── 1.1: Add UploadToken types
├── 1.2: Add API methods for upload links
└── 1.3: Create utility functions

COMPONENT DEVELOPMENT PHASE (Tasks 2-4)
├── 2.1: Create InvoiceUploadManager component
├── 2.2: Create UploadLinkForm sub-component
├── 2.3: Create GeneratedLinkDisplay sub-component
└── 2.4: Create state management hooks

INTEGRATION PHASE (Tasks 3-5)
├── 3.1: Add Upload Invoice tab to PODetail
├── 3.2: Wire InvoiceUploadManager to PODetail
├── 3.3: Add conditional rendering based on PO status
└── 3.4: Test tab navigation and state preservation

CLEANUP PHASE (Task 6)
└── 6.1: Remove UploadLinkGenerator from Invoice page

TESTING PHASE (Tasks 7-9)
├── 7.1-7.5: Unit tests for components
├── 8.1-8.3: Integration tests
└── 9.1-9.15: Property-based tests

VERIFICATION PHASE (Task 10)
└── 10.1-10.3: Manual testing and validation
```

---

## Tasks

### PREPARATION PHASE

- [x] 1.1 Add UploadToken and related types to types/index.ts
  - Add `UploadLinkState` interface for component state management
  - Add `UploadLinkFormData` interface for form inputs
  - Add `GeneratedLinkMetadata` interface for display data
  - Verify types align with API response structure
  - _Requirements: 3.4, 3.5, 3.6, 8.3, 8.4_

- [x] 1.2 Add API methods for upload link generation and email sending
  - Add `generateUploadLink()` method to invoiceService (already exists, verify implementation)
  - Add `sendUploadLink()` method to invoiceService (already exists, verify implementation)
  - Add `validateUploadToken()` method to invoiceService (already exists, verify implementation)
  - Verify error handling for 400, 404, 429, 500 status codes
  - Verify request/response payload structure matches design
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 1.3 Create utility functions for upload link management
  - Create `buildUploadUrl()` function to construct vendor upload portal URL with token
  - Create `calculateExpirationTime()` function to convert expiresIn to human-readable format
  - Create `formatExpirationDisplay()` function to format expiration time for UI display
  - Create `validateVendorEmail()` function for client-side email validation
  - Add functions to `src/utils/uploadLinkUtils.ts`
  - _Requirements: 3.7, 15.1, 15.2, 12.1_

---

### COMPONENT DEVELOPMENT PHASE

- [x] 2.1 Create InvoiceUploadManager component
  - Create `src/components/invoice-upload/InvoiceUploadManager.tsx`
  - Implement component props interface with `po: PurchaseOrder`, optional callbacks
  - Implement state management using React hooks for form inputs and generated link
  - Implement `handleGenerateLink()` method with validation and API call
  - Implement `handleCopyLink()` method with clipboard functionality
  - Implement `handleSendEmail()` method with API call
  - Implement `handleGenerateNewLink()` method to reset state
  - Implement conditional rendering based on PO status (delivered vs. other)
  - Implement error handling with toast notifications
  - Implement loading states for API calls
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.8, 3.9, 8.6, 8.7, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 2.2 Create UploadLinkForm sub-component
  - Create `src/components/invoice-upload/UploadLinkForm.tsx`
  - Implement form fields: Vendor Email (editable), PO Number (disabled), Link Expiry (dropdown)
  - Implement form validation before submission
  - Implement disabled state when link is generated
  - Implement loading state during API call
  - Implement "Generate Link" button with loading spinner
  - Add proper labels and placeholder text for accessibility
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 4.1, 9.6, 9.7, 12.1_

- [x] 2.3 Create GeneratedLinkDisplay sub-component
  - Create `src/components/invoice-upload/GeneratedLinkDisplay.tsx`
  - Implement read-only text field displaying generated link with monospace font
  - Implement "Copy Link" button with clipboard functionality
  - Implement QR code display using qrcode.react library
  - Implement "Send via Email" button with loading state
  - Implement "Generate New Link" button to reset state
  - Implement expiration time display in human-readable format
  - Implement visual styling: background color, border, card layout
  - Implement email sent state indicator
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2.4 Create custom hook for upload link state management
  - Create `src/hooks/useUploadLink.ts`
  - Implement hook to manage form state (vendorEmail, poNumber, expiresIn)
  - Implement hook to manage generated link state (token, url, expiresAt)
  - Implement hook to manage UI state (isGenerating, isSendingEmail, emailSent, formDisabled)
  - Implement hook to manage error state
  - Implement reset function to clear all state
  - Export hook for use in InvoiceUploadManager
  - _Requirements: 3.1, 3.2, 3.3, 3.8, 3.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

---

### INTEGRATION PHASE

- [x] 3.1 Add "Upload Invoice" tab to PODetail page
  - Open `src/pages/purchase-orders/PODetail.tsx`
  - Add new tab object to tabs array with id "upload", label "Upload Invoice"
  - Position tab after "Invoices" tab and before "Audit Log" tab
  - Import InvoiceUploadManager component
  - Set tab content to render InvoiceUploadManager component
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 3.2 Wire InvoiceUploadManager to PODetail page
  - Pass `po` prop to InvoiceUploadManager component
  - Implement optional `onLinkGenerated` callback to refresh PO data if needed
  - Implement optional `onEmailSent` callback for analytics or logging
  - Verify component receives correct PO data from parent
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 3.3 Implement conditional rendering based on PO status
  - Add logic to show/hide "Upload Invoice" tab based on PO status
  - Show tab only when `po.status === 'delivered'`
  - Display message "Invoice upload is available only for delivered purchase orders" when status is not delivered
  - Implement state change detection to hide component if PO status changes
  - _Requirements: 2.1, 2.2, 2.3, 9.5, 11.2, 12.5_

- [x] 3.4 Test tab navigation and state preservation
  - Verify tab selection state is preserved during session
  - Verify switching between tabs does not reset InvoiceUploadManager state
  - Verify component unmounts/remounts correctly when navigating away and back
  - Verify form resets when navigating away and returning to PO detail page
  - _Requirements: 11.6, 12.4_

---

### CLEANUP PHASE

- [x] 4.1 Remove UploadLinkGenerator component from Invoice page
  - Open `src/pages/invoices/InvoiceList.tsx` or `InvoiceDetail.tsx` (identify which file contains UploadLinkGenerator)
  - Remove import statement for UploadLinkGenerator component
  - Remove UploadLinkGenerator component from JSX
  - Remove any state management related to upload link generation
  - Remove any API calls related to upload link generation from Invoice page
  - Verify Invoice page still displays invoice list and detail views correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4.2 Update Invoice page tests
  - Remove tests related to UploadLinkGenerator component
  - Verify remaining Invoice page tests pass
  - Update test snapshots if needed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4.3 Deprecate UploadLinkGenerator component
  - Add deprecation notice to UploadLinkGenerator component file
  - Consider removing file entirely or keeping for backward compatibility
  - Update any documentation referencing the old component
  - _Requirements: 1.5_

---

### TESTING PHASE

#### Unit Tests for Components

- [ ]* 5.1 Write unit tests for UploadLinkForm component
  - Test that form fields are rendered with correct labels
  - Test that vendor email field is editable
  - Test that PO number field is disabled
  - Test that link expiry dropdown shows all options (1h, 24h, 7d)
  - Test that form validation shows error for empty vendor email
  - Test that form validation shows error for invalid email format
  - Test that "Generate Link" button is enabled when form is valid
  - Test that "Generate Link" button is disabled when form is invalid
  - Test that form fields are disabled after link generation
  - Test that form fields are re-enabled after clicking "Generate New Link"
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 4.1, 9.6, 9.7, 12.1_

- [ ]* 5.2 Write unit tests for GeneratedLinkDisplay component
  - Test that generated link is displayed in read-only text field
  - Test that "Copy Link" button copies URL to clipboard
  - Test that success toast is shown after copying
  - Test that QR code is rendered with correct size (200x200px)
  - Test that QR code encodes the correct URL
  - Test that "Send via Email" button is enabled after link generation
  - Test that "Send via Email" button is disabled after email is sent
  - Test that "Generate New Link" button resets all state
  - Test that expiration time is displayed in human-readable format
  - Test that email sent state indicator is shown
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 5.3 Write unit tests for InvoiceUploadManager component
  - Test that component is visible when PO status is "delivered"
  - Test that component is hidden when PO status is not "delivered"
  - Test that form is displayed initially
  - Test that generated link display is shown after successful API call
  - Test that error toast is shown on API failure
  - Test that loading state is shown during API call
  - Test that form fields are pre-filled with PO data
  - Test that vendor email can be overridden
  - Test that PO number is disabled
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.8, 3.9, 8.6, 8.7, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 5.4 Write unit tests for utility functions
  - Test `buildUploadUrl()` constructs correct URL with token
  - Test `calculateExpirationTime()` converts '1h' to 1 hour, '24h' to 24 hours, '7d' to 7 days
  - Test `formatExpirationDisplay()` formats time in human-readable format
  - Test `validateVendorEmail()` accepts valid emails
  - Test `validateVendorEmail()` rejects invalid emails
  - Test `validateVendorEmail()` rejects empty/whitespace-only emails
  - _Requirements: 3.7, 15.1, 15.2, 12.1_

- [ ]* 5.5 Write unit tests for PODetail page integration
  - Test that "Upload Invoice" tab is visible when PO status is "delivered"
  - Test that "Upload Invoice" tab is hidden when PO status is not "delivered"
  - Test that clicking "Upload Invoice" tab displays InvoiceUploadManager
  - Test that tab selection state is preserved
  - Test that other tabs still function correctly
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

#### Integration Tests

- [ ]* 6.1 Write integration test for upload link generation API
  - Test that `generateUploadLink()` API call succeeds with valid payload
  - Test that API response contains token, vendorEmail, poNumber, expiresAt, createdAt
  - Test that generated token is a valid JWT
  - Test that token contains vendorEmail and poNumber in payload
  - Test that expiresAt is correctly calculated based on expiresIn
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 14.1, 14.2, 14.3_

- [ ]* 6.2 Write integration test for email sending API
  - Test that `sendUploadLink()` API call succeeds with valid payload
  - Test that email is sent to correct vendor email
  - Test that email contains upload link
  - Test that email contains PO number
  - Test that email contains expiration information
  - Test that email contains instructions for vendor
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ]* 6.3 Write integration test for PO status transitions
  - Test that InvoiceUploadManager is visible when PO status is "delivered"
  - Test that InvoiceUploadManager is hidden when PO status changes from "delivered" to other
  - Test that component state is cleared when PO status changes
  - Test that component is re-displayed when PO status changes back to "delivered"
  - _Requirements: 2.1, 2.2, 2.3, 12.5_

#### Property-Based Tests

- [ ]* 7.1 Write property test: Upload link visibility based on PO status
  - **Property 1: Upload Link Visibility Based on PO Status**
  - **Validates: Requirements 2.1, 2.2, 2.3, 9.5, 11.2**
  - Generate random PO with status "delivered" → InvoiceUploadManager should be visible
  - Generate random PO with status other than "delivered" → InvoiceUploadManager should be hidden
  - Test all possible PO statuses (draft, pending_approval, approved, open, partial, delivered, closed, cancelled)
  - Verify visibility state matches PO status

- [ ]* 7.2 Write property test: Generated link contains required metadata
  - **Property 2: Generated Link Contains Required Metadata**
  - **Validates: Requirements 3.4, 3.5, 3.6, 8.3, 8.4**
  - For any generated upload link, token payload should contain vendorEmail and poNumber
  - Generate random vendorEmail and poNumber → verify they appear in token
  - Generate multiple links with different emails/PO numbers → verify each contains correct metadata
  - Verify token is a valid JWT with correct claims

- [ ]* 7.3 Write property test: Link expiration time accuracy
  - **Property 3: Link Expiration Time Accuracy**
  - **Validates: Requirements 3.7, 15.2, 15.3**
  - For any expiresIn duration ('1h', '24h', '7d'), expiresAt should equal current time + duration (±1 second)
  - Generate random current time → calculate expiresAt for each duration
  - Verify expiresAt is within tolerance of expected time
  - Test edge cases: midnight transitions, daylight saving time

- [ ]* 7.4 Write property test: QR code encodes correct URL
  - **Property 4: QR Code Encodes Correct URL**
  - **Validates: Requirements 5.3**
  - For any generated upload link, QR code should encode the exact URL displayed
  - Generate random tokens → verify QR code content matches URL
  - Verify QR code is scannable and resolves to correct URL
  - Test with various URL lengths and special characters

- [ ]* 7.5 Write property test: Form reset completeness
  - **Property 5: Form Reset Completeness**
  - **Validates: Requirements 7.2**
  - For any form reset operation, all fields should return to initial values
  - Generate random form state → reset → verify all fields match initial values
  - Verify vendorEmail = po.vendor.email, poNumber = po.poNumber, expiresIn = '24h'
  - Test multiple reset cycles

- [ ]* 7.6 Write property test: Multiple links remain valid
  - **Property 6: Multiple Links Remain Valid**
  - **Validates: Requirements 7.4, 7.5**
  - For any two upload links generated sequentially, both should remain valid until expiration
  - Generate link 1 → generate link 2 → verify both are valid
  - Test with various time intervals between generations
  - Verify each link has independent expiration time

- [ ]* 7.7 Write property test: Email validation
  - **Property 7: Email Validation**
  - **Validates: Requirements 12.1**
  - For any empty or whitespace-only vendor email, system should display error and not make API call
  - Generate random whitespace strings → verify error is shown
  - Verify no API call is made for invalid emails
  - Test edge cases: tabs, newlines, mixed whitespace

- [ ]* 7.8 Write property test: Email send validation
  - **Property 8: Email Send Validation**
  - **Validates: Requirements 12.7**
  - For any attempt to send email without generating link, system should display error
  - Attempt to send email in initial state → verify error message
  - Verify error message is "Please generate a link first"
  - Test multiple rapid attempts

- [ ]* 7.9 Write property test: No duplicate API calls
  - **Property 9: No Duplicate API Calls**
  - **Validates: Requirements 8.7**
  - For any rapid sequence of button clicks (within 500ms), system should make only one API call
  - Simulate rapid clicks → verify only one API call is made
  - Test with various click intervals (100ms, 200ms, 500ms, 1000ms)
  - Verify button is disabled during API call

- [ ]* 7.10 Write property test: Expiration time display format
  - **Property 10: Expiration Time Display Format**
  - **Validates: Requirements 15.1, 15.2**
  - For any generated upload link, expiration time should be displayed in human-readable format
  - Generate random expiresAt times → verify display format is readable
  - Test various time formats: "Expires in X hours", "Expires at YYYY-MM-DD HH:MM:SS UTC"
  - Verify format is consistent across different time zones

- [ ]* 7.11 Write property test: Link expiry options enforcement
  - **Property 11: Link Expiry Options Enforcement**
  - **Validates: Requirements 14.4, 14.5**
  - For any form submission, expiresIn should be one of predefined options ('1h', '24h', '7d')
  - Attempt to submit with custom expiresIn values → verify rejection
  - Verify only predefined options are accepted
  - Test with various invalid values (numbers, strings, null)

- [ ]* 7.12 Write property test: JWT token security
  - **Property 12: JWT Token Security**
  - **Validates: Requirements 14.1, 14.2, 14.6**
  - For any generated upload link, token should be valid JWT with cryptographic signature
  - Generate random tokens → verify JWT structure (header.payload.signature)
  - Verify token is cryptographically signed
  - Verify token contains no sensitive information in plain text
  - Test token tampering detection

- [ ]* 7.13 Write property test: Backward compatibility
  - **Property 13: Backward Compatibility**
  - **Validates: Requirements 10.1, 10.2, 10.3**
  - For any upload link generated from new PO-based workflow, link format should be compatible with vendor upload portal
  - Generate links from new workflow → verify they work with vendor portal
  - Compare with links generated from old workflow (if available)
  - Verify identical functionality

- [ ]* 7.14 Write property test: PO status reactivity
  - **Property 14: PO Status Reactivity**
  - **Validates: Requirements 12.5**
  - For any PO status change while viewing detail page, InvoiceUploadManager visibility should update immediately
  - Simulate PO status change → verify component visibility updates
  - Test all status transitions
  - Verify no manual refresh needed

- [ ]* 7.15 Write property test: Expiration warning display
  - **Property 15: Expiration Warning Display**
  - **Validates: Requirements 15.5**
  - For any generated upload link with less than 1 hour remaining, system should display visual warning
  - Generate links with various remaining times → verify warning appears for <1 hour
  - Verify warning is not shown for ≥1 hour remaining
  - Test edge case: exactly 1 hour remaining

---

### VERIFICATION PHASE

- [ ]* 8.1 Manual testing: Generate upload link from delivered PO
  - Navigate to a delivered PO detail page
  - Click "Upload Invoice" tab
  - Enter vendor email (or use pre-filled value)
  - Select link expiry duration
  - Click "Generate Link" button
  - Verify link is generated and displayed
  - Verify link contains correct token
  - Verify expiration time is displayed correctly
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ]* 8.2 Manual testing: Copy link and send via email
  - From generated link display, click "Copy Link" button
  - Verify success toast is shown
  - Verify link is copied to clipboard
  - Click "Send via Email" button
  - Verify email is sent to vendor
  - Verify success toast is shown
  - Verify "Send via Email" button is disabled after sending
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ]* 8.3 Manual testing: QR code scanning and vendor upload
  - From generated link display, scan QR code with mobile device
  - Verify QR code resolves to correct upload link
  - Verify vendor upload portal loads correctly
  - Verify vendor email is pre-filled
  - Verify PO number is displayed
  - Upload test invoice file
  - Verify invoice is uploaded successfully
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 8.4 Manual testing: Non-delivered PO behavior
  - Navigate to a non-delivered PO detail page
  - Verify "Upload Invoice" tab is not visible or is disabled
  - Verify message "Invoice upload is available only for delivered purchase orders" is shown
  - Verify no upload functionality is available
  - _Requirements: 2.1, 2.2, 2.3, 9.5, 11.2, 12.5_

- [ ]* 8.5 Manual testing: Error handling
  - Attempt to generate link with empty vendor email
  - Verify error message is shown
  - Attempt to send email without generating link first
  - Verify error message is shown
  - Simulate API failure (network error, server error)
  - Verify appropriate error message is shown
  - Verify form remains in usable state for retry
  - _Requirements: 12.1, 12.2, 12.3, 12.6, 12.7, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ]* 8.6 Manual testing: Invoice page cleanup
  - Navigate to Invoice page
  - Verify "Generate Upload Link" feature is removed
  - Verify no upload link generation form is visible
  - Verify no generated link display card is visible
  - Verify Invoice page still displays invoice list and detail views correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ]* 8.7 Manual testing: Tab navigation and state preservation
  - Navigate to delivered PO detail page
  - Click "Upload Invoice" tab
  - Generate an upload link
  - Click another tab (e.g., "Details")
  - Click "Upload Invoice" tab again
  - Verify generated link is still displayed (state preserved)
  - Navigate away from PO detail page and back
  - Verify form is reset to initial state
  - _Requirements: 11.6, 12.4_

- [ ]* 8.8 Manual testing: Multiple link generation
  - Generate first upload link with email1@example.com
  - Click "Generate New Link"
  - Generate second upload link with email2@example.com
  - Verify both links are valid and functional
  - Verify each link has independent expiration time
  - Test that both links work with vendor upload portal
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]* 8.9 Manual testing: Accessibility
  - Test keyboard navigation through form fields
  - Verify all buttons are keyboard accessible
  - Verify form labels are properly associated with inputs
  - Verify error messages are announced to screen readers
  - Verify color contrast meets WCAG AA standards
  - Test with screen reader (NVDA, JAWS, or VoiceOver)
  - _Requirements: 9.6, 9.7_

- [ ]* 8.10 Manual testing: Browser compatibility
  - Test in Chrome, Firefox, Safari, Edge
  - Verify QR code generation works in all browsers
  - Verify clipboard functionality works in all browsers
  - Verify form submission works in all browsers
  - Verify responsive design on mobile devices
  - _Requirements: All_

---

## Checkpoint Tasks

- [x] 9.1 Checkpoint: Preparation phase complete
  - Ensure all types are added to types/index.ts
  - Ensure all API methods are implemented in invoiceService
  - Ensure all utility functions are created and exported
  - Run type checking: `npm run type-check` or `tsc --noEmit`
  - Verify no TypeScript errors
  - Ask the user if questions arise.

- [x] 9.2 Checkpoint: Component development complete
  - Ensure all components are created and exported
  - Ensure all components render without errors
  - Ensure all state management is working correctly
  - Run linter: `npm run lint`
  - Verify no linting errors
  - Ask the user if questions arise.

- [x] 9.3 Checkpoint: Integration complete
  - Ensure InvoiceUploadManager is integrated into PODetail page
  - Ensure "Upload Invoice" tab is visible for delivered POs
  - Ensure tab navigation works correctly
  - Run build: `npm run build`
  - Verify build succeeds without errors
  - Ask the user if questions arise.

- [~] 9.4 Checkpoint: All tests pass
  - Run unit tests: `npm run test -- --run`
  - Verify all unit tests pass
  - Run integration tests: `npm run test:integration -- --run`
  - Verify all integration tests pass
  - Run property-based tests: `npm run test:pbt -- --run`
  - Verify all property-based tests pass
  - Ask the user if questions arise.

- [~] 9.5 Checkpoint: Manual testing complete
  - Ensure all manual testing scenarios have been executed
  - Ensure no critical issues remain
  - Ensure user experience is smooth and intuitive
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and early error detection
- Property-based tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate API integration and cross-component interactions
- Manual testing validates end-to-end workflows and user experience
- All tasks should be completed in order within each phase, but phases can be parallelized where dependencies allow
- The DAG structure allows tasks 1.1-1.3 to run in parallel, tasks 2.1-2.4 to run in parallel after preparation, etc.

