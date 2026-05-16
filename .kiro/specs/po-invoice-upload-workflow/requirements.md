# PO-Based Invoice Upload Workflow - Requirements Document

## Introduction

This document specifies the requirements for moving invoice upload functionality from the Invoice page to Purchase Orders (POs). The new workflow enables vendors to upload invoices directly through delivered POs, streamlining the invoice submission process and improving the connection between purchase orders and their corresponding invoices.

**Current State:** Invoice page has a "Generate Upload Link" feature that creates secure links for vendors to upload invoices.

**New State:** Invoice upload functionality moves to the PO detail page, available only when a PO has been delivered. Vendors can upload invoice links and send them through the PO interface.

---

## Glossary

- **System**: The Invoice Portal application
- **Invoice_Upload_Manager**: The component/service responsible for managing invoice upload links and sending operations
- **PO_Detail_Page**: The Purchase Order detail view page
- **Invoice_Page**: The main invoice management page
- **Upload_Link_Generator**: The feature that creates secure JWT-signed links for vendor invoice uploads
- **Delivered_PO**: A Purchase Order with status equal to "delivered"
- **Upload_Link**: A secure, time-limited URL that vendors use to upload invoices
- **Vendor_Email**: The email address of the vendor associated with the PO
- **Link_Expiry**: The time duration after which an upload link becomes invalid (1 hour, 24 hours, or 7 days)
- **JWT_Token**: A JSON Web Token used to secure and validate upload links
- **QR_Code**: A machine-readable code that encodes the upload link for easy scanning
- **Email_Notification**: An automated email sent to the vendor containing the upload link

---

## Requirements

### Requirement 1: Remove Upload Link Generation from Invoice Page

**User Story:** As an administrator, I want the "Generate Upload Link" feature removed from the Invoice page, so that invoice upload functionality is centralized in the PO workflow.

#### Acceptance Criteria

1. THE Invoice_Page SHALL NOT display the "Generate Upload Link" button or feature
2. THE Invoice_Page SHALL NOT display the upload link generation form (vendor email, PO number, expiry fields)
3. THE Invoice_Page SHALL NOT display the generated link display card with copy and QR code functionality
4. WHEN a user navigates to the Invoice page, THE System SHALL display only invoice list and invoice detail views without upload link generation options
5. THE UploadLinkGenerator component file SHALL be removed from the codebase or deprecated
6. THE Invoice_Page routing SHALL remain unchanged and functional

---

### Requirement 2: Add Invoice Upload Section to Delivered PO Detail Page

**User Story:** As an administrator, I want to upload invoice links directly from a delivered PO, so that I can manage invoices in the context of their purchase orders.

#### Acceptance Criteria

1. WHEN a PO has status "delivered", THE PO_Detail_Page SHALL display an "Invoice Upload" section or tab
2. WHEN a PO has status other than "delivered", THE PO_Detail_Page SHALL NOT display the "Invoice Upload" section
3. THE Invoice_Upload_Manager SHALL be accessible only when viewing a Delivered_PO
4. THE Invoice_Upload_Manager form SHALL include fields for: Vendor_Email, PO_Number (pre-filled), and Link_Expiry selection
5. THE PO_Number field in the Invoice_Upload_Manager form SHALL be pre-populated with the current PO's number and disabled for editing
6. THE Vendor_Email field SHALL be pre-populated with the PO's associated vendor email and editable to allow override
7. THE Link_Expiry field SHALL default to "24 hours" with options for "1 hour", "24 hours", and "7 days"

---

### Requirement 3: Generate Upload Links from Delivered PO

**User Story:** As an administrator, I want to generate secure upload links from the PO detail page, so that vendors can upload invoices associated with the PO.

#### Acceptance Criteria

1. WHEN the user clicks "Generate Link" button in the Invoice_Upload_Manager, THE System SHALL call the upload link generation API endpoint
2. WHEN the API call succeeds, THE System SHALL display the generated Upload_Link in a display card
3. WHEN the API call fails, THE System SHALL display an error toast notification with message "Failed to generate link"
4. THE generated Upload_Link SHALL be a secure URL containing a JWT_Token
5. THE Upload_Link SHALL include the PO_Number as a parameter or metadata
6. THE Upload_Link SHALL include the Vendor_Email as a parameter or metadata
7. THE Upload_Link SHALL expire after the selected Link_Expiry duration
8. AFTER generating a link, THE Invoice_Upload_Manager form fields SHALL become disabled to prevent modification
9. THE Invoice_Upload_Manager SHALL display a "Generate New Link" button to allow creating another link with different parameters

---

### Requirement 4: Display Generated Upload Link with Copy Functionality

**User Story:** As an administrator, I want to easily copy the generated upload link, so that I can share it with vendors through other channels.

#### Acceptance Criteria

1. WHEN an Upload_Link is generated, THE System SHALL display the link in a read-only text field
2. THE System SHALL display a "Copy Link" button next to the Upload_Link display
3. WHEN the user clicks "Copy Link", THE System SHALL copy the Upload_Link to the clipboard
4. WHEN the link is copied, THE System SHALL display a success toast notification with message "Link copied to clipboard"
5. THE Upload_Link display card SHALL have a distinct visual style (background color, border) to indicate it is generated content
6. THE Upload_Link text SHALL be formatted with monospace font for clarity
7. THE Upload_Link SHALL be selectable for manual copying if the copy button fails

---

### Requirement 5: Display QR Code for Upload Link

**User Story:** As an administrator, I want to display a QR code for the upload link, so that vendors can quickly access the upload portal by scanning with their mobile devices.

#### Acceptance Criteria

1. WHEN an Upload_Link is generated, THE System SHALL display a QR_Code that encodes the Upload_Link
2. THE QR_Code SHALL be displayed below the Upload_Link text in the generated link display card
3. THE QR_Code SHALL be scannable and resolve to the Upload_Link URL
4. THE QR_Code SHALL have sufficient size (minimum 200x200 pixels) for reliable scanning
5. THE QR_Code SHALL use high error correction level (Level H) to ensure scannability even if partially obscured
6. THE QR_Code display SHALL include a caption "Scan to open upload link"
7. THE QR_Code background color SHALL match the System's dark theme (dark background with light foreground)

---

### Requirement 6: Send Upload Link via Email from Delivered PO

**User Story:** As an administrator, I want to send the upload link directly to the vendor's email, so that vendors receive the link without manual copying and sharing.

#### Acceptance Criteria

1. WHEN an Upload_Link is generated, THE System SHALL display a "Send via Email" button
2. WHEN the user clicks "Send via Email", THE System SHALL call the send upload link API endpoint with the Vendor_Email, PO_Number, and Link_Expiry
3. WHEN the email is sent successfully, THE System SHALL display a success toast notification with message "Upload link sent to vendor email"
4. WHEN the email send fails, THE System SHALL display an error toast notification with message "Failed to send email. Please try again."
5. AFTER the email is sent, THE "Send via Email" button SHALL be disabled and display "Email Sent" text
6. THE email notification SHALL include the Upload_Link
7. THE email notification SHALL include the PO_Number for context
8. THE email notification SHALL include the Link_Expiry information
9. THE email notification SHALL include instructions for the vendor on how to use the upload link

---

### Requirement 7: Manage Upload Link State in Delivered PO

**User Story:** As an administrator, I want to manage the state of upload links within the PO context, so that I can generate multiple links and track which one was sent.

#### Acceptance Criteria

1. WHEN a new Upload_Link is generated, THE System SHALL clear the previous link display and show only the new link
2. WHEN the user clicks "Generate New Link", THE System SHALL reset the Invoice_Upload_Manager form fields to their default values
3. WHEN the user clicks "Generate New Link", THE System SHALL clear the generated link display card
4. THE System SHALL allow generating multiple Upload_Links for the same Delivered_PO with different parameters
5. WHEN an Upload_Link is generated and then a new link is generated, THE previous link SHALL remain valid until its expiration time
6. THE System SHALL display the current state clearly (form visible vs. link generated) through visual indicators

---

### Requirement 8: Integrate Upload Link Generation with PO API

**User Story:** As a developer, I want the upload link generation to work seamlessly with the existing PO API, so that the feature integrates properly with the backend.

#### Acceptance Criteria

1. THE System SHALL use the existing `/invoices/upload-links/generate` API endpoint for generating Upload_Links
2. THE System SHALL use the existing `/invoices/upload-links/send` API endpoint for sending Upload_Links via email
3. THE API request payload SHALL include: vendorEmail, poNumber, and expiresIn
4. THE API response SHALL include: token, vendorEmail, poNumber, expiresAt, and createdAt
5. THE System SHALL handle API errors gracefully with appropriate error messages
6. THE System SHALL include proper loading states during API calls
7. THE System SHALL not make duplicate API calls if the user clicks buttons multiple times rapidly

---

### Requirement 9: Update PO Detail Page UI/UX

**User Story:** As a user, I want the PO detail page to clearly show where I can upload invoices, so that the workflow is intuitive and discoverable.

#### Acceptance Criteria

1. THE PO_Detail_Page SHALL display the Invoice_Upload_Manager in a new tab labeled "Upload Invoice" or in a dedicated section
2. THE Invoice_Upload_Manager section SHALL be visually distinct from other PO information (different background, border, or card styling)
3. THE Invoice_Upload_Manager section SHALL include a clear heading "Upload Invoice Link"
4. THE Invoice_Upload_Manager section SHALL include descriptive text explaining its purpose
5. WHEN a PO is not in "delivered" status, THE Invoice_Upload_Manager section SHALL display a message "Invoice upload is available only for delivered purchase orders"
6. THE Invoice_Upload_Manager form fields SHALL have clear labels and placeholder text
7. THE Invoice_Upload_Manager buttons SHALL have clear, action-oriented labels ("Generate Link", "Copy Link", "Send via Email")
8. THE Invoice_Upload_Manager display card SHALL use visual hierarchy to distinguish the generated link from the form

---

### Requirement 10: Maintain Backward Compatibility with Invoice Upload Portal

**User Story:** As a vendor, I want the existing vendor upload portal to continue working, so that previously generated links remain functional.

#### Acceptance Criteria

1. THE existing `/vendor-upload` page SHALL continue to function with tokens generated from the new PO-based workflow
2. THE existing `/vendor-upload` page SHALL continue to function with tokens generated from the old Invoice page workflow (if any exist)
3. THE Upload_Link format SHALL remain compatible with the existing vendor upload portal
4. THE JWT_Token validation logic SHALL not change
5. THE vendor upload portal SHALL accept PO_Number as a parameter and display it in the upload form
6. THE vendor upload portal SHALL accept Vendor_Email as a parameter and pre-fill it in the upload form

---

### Requirement 11: Add Invoice Upload Tab to PO Detail Page

**User Story:** As an administrator, I want to see all invoice-related actions in one place on the PO detail page, so that I can manage invoices efficiently.

#### Acceptance Criteria

1. THE PO_Detail_Page tabs SHALL include a new "Upload Invoice" tab alongside existing tabs (Details, Line Items, Invoices, Audit Log)
2. THE "Upload Invoice" tab SHALL be visible only when the PO status is "delivered"
3. THE "Upload Invoice" tab SHALL contain the Invoice_Upload_Manager component
4. THE "Upload Invoice" tab SHALL be positioned logically (after "Invoices" tab or before "Audit Log" tab)
5. WHEN the user clicks the "Upload Invoice" tab, THE System SHALL display the Invoice_Upload_Manager form
6. THE tab selection state SHALL be preserved during the session

---

### Requirement 12: Handle Edge Cases and Error Scenarios

**User Story:** As a developer, I want the system to handle edge cases gracefully, so that the feature is robust and reliable.

#### Acceptance Criteria

1. IF the Vendor_Email field is empty, THEN THE System SHALL display an error message "Please enter vendor email" when the user clicks "Generate Link"
2. IF the API call to generate a link fails, THEN THE System SHALL display an error toast and keep the form in its current state
3. IF the API call to send an email fails, THEN THE System SHALL display an error toast and keep the "Send via Email" button enabled for retry
4. IF the user navigates away from the PO detail page and returns, THEN THE System SHALL reset the Invoice_Upload_Manager to its initial state
5. IF the PO status changes from "delivered" to another status while the user is on the page, THEN THE System SHALL hide the Invoice_Upload_Manager section
6. IF the generated link expires, THEN THE System SHALL display the expiration time clearly in the link display card
7. IF the user tries to send an email without generating a link first, THEN THE System SHALL display an error message "Please generate a link first"

---

### Requirement 13: Provide User Feedback and Confirmation

**User Story:** As a user, I want clear feedback on my actions, so that I know whether operations succeeded or failed.

#### Acceptance Criteria

1. WHEN the user clicks "Generate Link", THE System SHALL display a loading state on the button
2. WHEN the link generation succeeds, THE System SHALL display a success toast notification with message "Upload link generated"
3. WHEN the user clicks "Copy Link", THE System SHALL display a success toast notification with message "Link copied to clipboard"
4. WHEN the user clicks "Send via Email", THE System SHALL display a loading state on the button
5. WHEN the email is sent successfully, THE System SHALL display a success toast notification with message "Upload link sent to vendor email"
6. ALL error messages SHALL be clear and actionable
7. ALL success messages SHALL confirm the action that was completed

---

### Requirement 14: Ensure Security of Upload Links

**User Story:** As a security officer, I want upload links to be secure and time-limited, so that unauthorized access is prevented.

#### Acceptance Criteria

1. THE Upload_Link SHALL be signed with a JWT_Token containing the vendorEmail, poNumber, and expiresAt
2. THE JWT_Token SHALL be cryptographically signed to prevent tampering
3. THE Upload_Link expiration time SHALL be enforced by the backend
4. THE Link_Expiry options (1 hour, 24 hours, 7 days) SHALL be the only available durations
5. THE System SHALL not allow custom expiration times outside the predefined options
6. THE Upload_Link SHALL not contain sensitive information in plain text (only the JWT_Token)
7. THE Upload_Link SHALL be transmitted over HTTPS only
8. THE System SHALL validate the JWT_Token on the vendor upload portal before allowing invoice upload

---

### Requirement 15: Display Upload Link Expiration Information

**User Story:** As an administrator, I want to see when the upload link expires, so that I know how long vendors have to use it.

#### Acceptance Criteria

1. WHEN an Upload_Link is generated, THE System SHALL display the expiration time in the link display card
2. THE expiration time SHALL be displayed in a human-readable format (e.g., "Expires in 24 hours" or "Expires at 2024-12-25 14:30:00")
3. THE expiration time SHALL be calculated based on the current time and the selected Link_Expiry duration
4. THE expiration information SHALL be clearly visible and easy to understand
5. THE System SHALL display a warning if the link is expiring soon (e.g., less than 1 hour remaining)

---

## Acceptance Criteria Summary

### Property-Based Testing Candidates

1. **Round-Trip Property**: FOR ALL generated Upload_Links, validating the token and extracting the payload SHALL produce the same vendorEmail and poNumber that were used to generate the link.

2. **Idempotence Property**: Generating multiple Upload_Links with the same parameters (vendorEmail, poNumber, expiresIn) for the same Delivered_PO SHALL produce valid tokens that both work independently.

3. **Invariant Property**: FOR ALL Delivered_POs, the Invoice_Upload_Manager section SHALL be visible, and for all non-Delivered_POs, the Invoice_Upload_Manager section SHALL NOT be visible.

4. **Metamorphic Property**: The number of Upload_Links that can be generated for a single Delivered_PO SHALL be unlimited (no artificial limit).

### Integration Testing Candidates

1. **Email Delivery**: Sending an upload link via email to a vendor SHALL result in the vendor receiving an email with the correct link and PO information.

2. **Vendor Upload Portal Integration**: A vendor using an Upload_Link generated from the PO detail page SHALL be able to upload an invoice through the existing vendor upload portal.

3. **PO Status Transition**: When a PO transitions from "delivered" to another status, the Invoice_Upload_Manager section SHALL become hidden.

4. **API Error Handling**: When the backend API returns an error, the System SHALL display an appropriate error message and maintain a consistent state.

