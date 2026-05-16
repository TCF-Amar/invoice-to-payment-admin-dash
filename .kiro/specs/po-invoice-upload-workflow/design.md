# PO-Based Invoice Upload Workflow - Design Document

## Overview

This design document specifies the technical implementation of moving invoice upload functionality from the Invoice page to Purchase Order (PO) detail pages. The feature enables administrators to generate secure upload links for vendors directly within the context of delivered purchase orders, streamlining the invoice submission workflow.

**Key Design Principles:**
- Centralize invoice upload management within PO workflow
- Maintain backward compatibility with existing vendor upload portal
- Provide secure, time-limited access through JWT-signed links
- Offer multiple sharing mechanisms (copy, QR code, email)
- Ensure robust error handling and user feedback

---

## Architecture

### Component Hierarchy

```
PODetail (Page)
├── PageHeader
├── StatusTimeline
└── Tabs
    ├── Details Tab
    ├── Line Items Tab
    ├── Invoices Tab
    ├── Upload Invoice Tab (NEW)
    │   └── InvoiceUploadManager (NEW)
    │       ├── UploadLinkForm
    │       ├── GeneratedLinkDisplay
    │       │   ├── LinkTextField
    │       │   ├── CopyButton
    │       │   ├── QRCodeDisplay
    │       │   └── SendEmailButton
    │       └── StateIndicators
    └── Audit Log Tab
```

### Component Responsibilities

**InvoiceUploadManager** (New Component)
- Manages the entire upload link workflow for a delivered PO
- Handles form state (vendor email, PO number, expiry duration)
- Orchestrates API calls for link generation and email sending
- Manages UI state transitions (form → generated link → email sent)
- Provides user feedback through toast notifications

**UploadLinkForm** (Sub-component)
- Renders form fields: Vendor Email, PO Number (disabled), Link Expiry
- Validates user input before submission
- Displays loading state during API calls
- Disables fields after link generation

**GeneratedLinkDisplay** (Sub-component)
- Displays the generated upload link in a read-only text field
- Renders copy button with clipboard functionality
- Renders QR code with proper sizing and error correction
- Renders send email button with state management
- Shows expiration time in human-readable format

---

## Data Flow

### Link Generation Flow

```
User clicks "Generate Link"
    ↓
Validate vendor email (client-side)
    ↓
Call POST /invoices/upload-links/generate
    ├─ Payload: { vendorEmail, poNumber, expiresIn }
    ├─ Response: { token, vendorEmail, poNumber, expiresAt, createdAt }
    ↓
Build upload URL: ${baseUrl}/vendor-upload?token=${token}
    ↓
Store in component state:
    ├─ generatedToken
    ├─ generatedUrl
    ├─ expiresAt
    ├─ formDisabled = true
    ↓
Display GeneratedLinkDisplay component
    ↓
Show success toast: "Upload link generated"
```

### Email Sending Flow

```
User clicks "Send via Email"
    ↓
Verify link is generated (client-side)
    ↓
Call POST /invoices/upload-links/send
    ├─ Payload: { vendorEmail, poNumber, expiresIn }
    ├─ Response: { success: true }
    ↓
Update component state:
    ├─ emailSent = true
    ├─ sendEmailButtonDisabled = true
    ↓
Show success toast: "Upload link sent to vendor email"
```

### State Reset Flow

```
User clicks "Generate New Link"
    ↓
Clear generated link state:
    ├─ generatedToken = ''
    ├─ generatedUrl = ''
    ├─ expiresAt = null
    ├─ emailSent = false
    ├─ formDisabled = false
    ↓
Reset form fields to defaults:
    ├─ vendorEmail = po.vendor.email
    ├─ poNumber = po.poNumber (unchanged)
    ├─ expiresIn = '24h'
    ↓
Display UploadLinkForm component
```

### PO Status Visibility Flow

```
Component mounts or PO status changes
    ↓
Check po.status === 'delivered'
    ├─ YES: Render InvoiceUploadManager
    ├─ NO: Render "Invoice upload is available only for delivered purchase orders"
    ↓
If status changes from 'delivered' to other:
    ├─ Hide InvoiceUploadManager
    ├─ Clear all state
```

---

## Components and Interfaces

### InvoiceUploadManager Component

**Props:**
```typescript
interface InvoiceUploadManagerProps {
  po: PurchaseOrder;
  onLinkGenerated?: (link: UploadToken) => void;
  onEmailSent?: () => void;
}
```

**State:**
```typescript
interface UploadManagerState {
  // Form inputs
  vendorEmail: string;
  poNumber: string;
  expiresIn: '1h' | '24h' | '7d';
  
  // Generated link
  generatedToken: string;
  generatedUrl: string;
  expiresAt: string | null;
  
  // UI state
  isGenerating: boolean;
  isSendingEmail: boolean;
  emailSent: boolean;
  formDisabled: boolean;
  
  // Error state
  error: string | null;
}
```

**Key Methods:**
- `handleGenerateLink()`: Validates input, calls API, updates state
- `handleCopyLink()`: Copies URL to clipboard, shows toast
- `handleSendEmail()`: Calls email API, updates state
- `handleGenerateNewLink()`: Resets all state
- `calculateExpirationTime()`: Converts expiresIn to human-readable format

### API Integration

**Endpoint: POST /invoices/upload-links/generate**

Request:
```typescript
{
  vendorEmail: string;      // Required: vendor's email address
  poNumber?: string;        // Optional: PO number for context
  expiresIn: '1h' | '24h' | '7d';  // Required: link expiration duration
}
```

Response:
```typescript
{
  id: string;               // Unique token ID
  token: string;            // JWT token for upload link
  vendorEmail: string;      // Vendor email (echoed back)
  poNumber?: string;        // PO number (echoed back)
  expiresAt: string;        // ISO 8601 timestamp
  createdAt: string;        // ISO 8601 timestamp
}
```

**Endpoint: POST /invoices/upload-links/send**

Request:
```typescript
{
  vendorEmail: string;
  poNumber?: string;
  expiresIn: '1h' | '24h' | '7d';
}
```

Response:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## UI/UX Design

### Layout Structure

**Upload Invoice Tab Content:**

```
┌─────────────────────────────────────────────────────────┐
│ Upload Invoice Link                                     │
│ Generate and share secure upload links with vendors    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Form State]                    [Generated Link State] │
│  ┌──────────────────┐            ┌──────────────────┐  │
│  │ Vendor Email *   │            │ Upload Link      │  │
│  │ [vendor@ex.com]  │            │ [monospace text] │  │
│  │                  │            │ [Copy] [QR Code] │  │
│  │ PO Number        │            │ [Send Email]     │  │
│  │ [PO-2024-001]    │            │ Expires: 24h     │  │
│  │ (disabled)       │            │                  │  │
│  │                  │            │ [Generate New]   │  │
│  │ Link Expiry      │            │                  │  │
│  │ [24 Hours ▼]     │            │                  │  │
│  │                  │            │                  │  │
│  │ [Generate Link]  │            │                  │  │
│  └──────────────────┘            └──────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual States

**1. Initial State (Form Visible)**
- Form fields enabled and editable
- Vendor email pre-filled with PO vendor email
- PO number pre-filled and disabled
- Link expiry defaults to "24 hours"
- "Generate Link" button visible and enabled

**2. Loading State (During API Call)**
- "Generate Link" button shows loading spinner
- Form fields disabled
- Button text changes to "Generating..."

**3. Generated Link State (Link Displayed)**
- Form fields disabled
- Generated link displayed in read-only text field with monospace font
- Copy button enabled
- QR code displayed (200x200px minimum)
- Send Email button enabled
- "Generate New Link" button visible
- Expiration time displayed in human-readable format

**4. Email Sent State**
- "Send Email" button disabled
- Button text changes to "Email Sent"
- Success indicator shown (checkmark icon)
- Message: "Email sent successfully to [vendor@email.com]"

**5. Error State**
- Error toast notification displayed
- Form remains in previous state
- User can retry operation

### Color and Styling

**Generated Link Card:**
- Background: `bg-white/5` (subtle light overlay on dark background)
- Border: `border border-white/10` (subtle border)
- Text: `text-slate-100` (light text for readability)
- Font: `font-mono` (monospace for code-like appearance)

**QR Code:**
- Size: 200x200 pixels minimum
- Error Correction: Level H (30% recovery)
- Foreground: `#ffffff` (white)
- Background: `#0a0c10` (dark theme background)

**Buttons:**
- Primary: "Generate Link" - `variant="primary"`
- Secondary: "Copy Link", "Send Email" - `variant="ghost"` or `variant="primary"`
- Reset: "Generate New Link" - `variant="ghost"`

---

## State Management

### Component-Level State (React Hooks)

The InvoiceUploadManager uses React `useState` for local state management:

```typescript
// Form inputs
const [vendorEmail, setVendorEmail] = useState(po.vendor?.email || '');
const [poNumber, setPoNumber] = useState(po.poNumber);
const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '7d'>('24h');

// Generated link
const [generatedToken, setGeneratedToken] = useState('');
const [generatedUrl, setGeneratedUrl] = useState('');
const [expiresAt, setExpiresAt] = useState<string | null>(null);

// UI state
const [isGenerating, setIsGenerating] = useState(false);
const [isSendingEmail, setIsSendingEmail] = useState(false);
const [emailSent, setEmailSent] = useState(false);
const [formDisabled, setFormDisabled] = useState(false);
```

### State Transitions

**Form → Generated Link:**
```
User clicks "Generate Link"
  ↓
setIsGenerating(true)
  ↓
API call succeeds
  ↓
setGeneratedToken(response.token)
setGeneratedUrl(buildUrl(response.token))
setExpiresAt(response.expiresAt)
setFormDisabled(true)
setIsGenerating(false)
```

**Generated Link → Email Sent:**
```
User clicks "Send Email"
  ↓
setIsSendingEmail(true)
  ↓
API call succeeds
  ↓
setEmailSent(true)
setIsSendingEmail(false)
```

**Any State → Form Reset:**
```
User clicks "Generate New Link"
  ↓
setGeneratedToken('')
setGeneratedUrl('')
setExpiresAt(null)
setEmailSent(false)
setFormDisabled(false)
setVendorEmail(po.vendor?.email || '')
setExpiresIn('24h')
```

### Session State Preservation

- Tab selection state is preserved using Tabs component's built-in state management
- When user navigates away from PO detail page and returns, component unmounts/remounts
- On remount, all state resets to initial values (form visible, no generated link)
- This is acceptable behavior as per Requirement 12.4

---

## Error Handling

### Client-Side Validation

**Vendor Email Validation:**
```typescript
if (!vendorEmail || !vendorEmail.trim()) {
  toast.error('Please enter vendor email');
  return;
}

// Optional: Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(vendorEmail)) {
  toast.error('Please enter a valid email address');
  return;
}
```

**Form State Validation:**
```typescript
if (!generatedToken && action === 'send-email') {
  toast.error('Please generate a link first');
  return;
}
```

### API Error Handling

**Generate Link Errors:**
```typescript
try {
  const response = await invoiceService.generateUploadLink({
    vendorEmail,
    poNumber,
    expiresIn,
  });
  // Success handling
} catch (error) {
  if (error.response?.status === 400) {
    toast.error('Invalid email address or PO number');
  } else if (error.response?.status === 404) {
    toast.error('PO not found');
  } else if (error.response?.status === 500) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.error('Failed to generate link');
  }
  setIsGenerating(false);
}
```

**Send Email Errors:**
```typescript
try {
  await invoiceService.sendUploadLink({
    vendorEmail,
    poNumber,
    expiresIn,
  });
  // Success handling
} catch (error) {
  if (error.response?.status === 400) {
    toast.error('Invalid email address');
  } else if (error.response?.status === 429) {
    toast.error('Too many email requests. Please try again later.');
  } else {
    toast.error('Failed to send email. Please try again.');
  }
  setIsSendingEmail(false);
  // Keep button enabled for retry
}
```

### Error Recovery Strategies

1. **Generate Link Fails:**
   - Keep form visible and enabled
   - User can modify inputs and retry
   - No state is lost

2. **Send Email Fails:**
   - Keep "Send Email" button enabled
   - User can retry immediately
   - Generated link remains valid

3. **Network Timeout:**
   - Show timeout error message
   - Provide retry option
   - Maintain current state

4. **PO Status Changes:**
   - If PO status changes from "delivered" to other while user is on page
   - Hide InvoiceUploadManager
   - Show message: "Invoice upload is available only for delivered purchase orders"
   - Clear all state

---

## Testing Strategy

### Unit Tests

**Form Validation:**
- Test that empty vendor email shows error
- Test that valid email passes validation
- Test that form fields are disabled after link generation
- Test that form fields reset when "Generate New Link" is clicked

**State Management:**
- Test that generated link state is set correctly after API success
- Test that email sent state is set correctly
- Test that form state resets properly
- Test that expiration time is calculated correctly

**URL Building:**
- Test that upload URL is built correctly with token
- Test that URL includes correct base path

**QR Code:**
- Test that QR code is rendered with correct value
- Test that QR code has correct size (200x200px)
- Test that QR code uses Level H error correction

**Clipboard:**
- Test that copy button copies URL to clipboard
- Test that success toast is shown after copy

**Button States:**
- Test that buttons show loading state during API calls
- Test that buttons are disabled/enabled appropriately
- Test that button text changes based on state

### Integration Tests

**API Integration:**
- Test that generate link API is called with correct payload
- Test that send email API is called with correct payload
- Test that API errors are handled correctly
- Test that API responses are parsed correctly

**PO Status Integration:**
- Test that component is visible when PO status is "delivered"
- Test that component is hidden when PO status is not "delivered"
- Test that component hides when PO status changes

**Vendor Upload Portal Integration:**
- Test that generated link works with vendor upload portal
- Test that token is validated correctly
- Test that vendor email is pre-filled in upload form
- Test that PO number is displayed in upload form

**Email Delivery:**
- Test that email is sent to correct vendor email
- Test that email contains upload link
- Test that email contains PO number
- Test that email contains expiration information

### Property-Based Tests

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

#### Property 1: Upload Link Visibility Based on PO Status

*For any* Purchase Order, if the status is "delivered", the Invoice_Upload_Manager section SHALL be visible; if the status is not "delivered", the section SHALL NOT be visible.

**Validates: Requirements 2.1, 2.2, 2.3, 9.5, 11.2**

#### Property 2: Generated Link Contains Required Metadata

*For any* generated upload link, the token payload SHALL contain the vendorEmail and poNumber that were used to generate it.

**Validates: Requirements 3.4, 3.5, 3.6, 8.3, 8.4**

#### Property 3: Link Expiration Time Accuracy

*For any* generated upload link with a selected expiresIn duration, the calculated expiresAt time SHALL equal the current time plus the selected duration (±1 second tolerance for clock skew).

**Validates: Requirements 3.7, 15.2, 15.3**

#### Property 4: QR Code Encodes Correct URL

*For any* generated upload link, the QR code SHALL encode the exact upload URL that is displayed in the text field.

**Validates: Requirements 5.3**

#### Property 5: Form Reset Completeness

*For any* form reset operation, all form fields SHALL return to their initial values (vendorEmail = po.vendor.email, poNumber = po.poNumber, expiresIn = '24h').

**Validates: Requirements 7.2**

#### Property 6: Multiple Links Remain Valid

*For any* two upload links generated sequentially for the same PO, both links SHALL remain valid and functional until their respective expiration times.

**Validates: Requirements 7.4, 7.5**

#### Property 7: Email Validation

*For any* attempt to generate a link with an empty or whitespace-only vendor email, the system SHALL display an error message and not make an API call.

**Validates: Requirements 12.1**

#### Property 8: Email Send Validation

*For any* attempt to send an email without first generating a link, the system SHALL display an error message "Please generate a link first".

**Validates: Requirements 12.7**

#### Property 9: No Duplicate API Calls

*For any* rapid sequence of button clicks (within 500ms), the system SHALL make only one API call, not multiple calls.

**Validates: Requirements 8.7**

#### Property 10: Expiration Time Display Format

*For any* generated upload link, the expiration time SHALL be displayed in a human-readable format (e.g., "Expires in 24 hours" or "Expires at 2024-12-25 14:30:00 UTC").

**Validates: Requirements 15.1, 15.2**

#### Property 11: Link Expiry Options Enforcement

*For any* form submission, the expiresIn value SHALL be one of the predefined options ('1h', '24h', '7d'), and custom values SHALL NOT be accepted.

**Validates: Requirements 14.4, 14.5**

#### Property 12: JWT Token Security

*For any* generated upload link, the token SHALL be a valid JWT that is cryptographically signed and contains no sensitive information in plain text.

**Validates: Requirements 14.1, 14.2, 14.6**

#### Property 13: Backward Compatibility

*For any* upload link generated from the new PO-based workflow, the link format SHALL be compatible with the existing vendor upload portal and work identically to links generated from the old Invoice page workflow.

**Validates: Requirements 10.1, 10.2, 10.3**

#### Property 14: PO Status Reactivity

*For any* PO status change that occurs while the user is viewing the PO detail page, the Invoice_Upload_Manager visibility SHALL update immediately to reflect the new status.

**Validates: Requirements 12.5**

#### Property 15: Expiration Warning Display

*For any* generated upload link with less than 1 hour remaining until expiration, the system SHALL display a visual warning indicator.

**Validates: Requirements 15.5**

---

## Implementation Considerations

### Performance

1. **API Call Optimization:**
   - Debounce button clicks to prevent duplicate API calls
   - Use loading states to prevent user from clicking multiple times
   - Consider caching generated links for the same parameters

2. **QR Code Generation:**
   - QR code is generated client-side using qrcode.react library
   - No performance impact as it's a one-time generation
   - SVG format ensures scalability

3. **Component Rendering:**
   - Use React.memo for sub-components to prevent unnecessary re-renders
   - Memoize callback functions using useCallback

### Security

1. **JWT Token Handling:**
   - Tokens are generated by backend and never modified client-side
   - Tokens are transmitted over HTTPS only
   - Tokens are stored in component state (not localStorage) to prevent XSS attacks

2. **Email Validation:**
   - Validate email format on client-side for UX
   - Backend validates email format and existence
   - Backend enforces rate limiting on email sends

3. **CORS and API Security:**
   - API calls use existing API client with proper authentication
   - CORS headers are configured on backend
   - API endpoints require authentication

### Accessibility

1. **Form Labels:**
   - All form fields have associated labels
   - Labels use `htmlFor` attribute to link to inputs
   - Required fields marked with asterisk (*)

2. **Button Labels:**
   - All buttons have clear, descriptive labels
   - Loading states include aria-busy attribute
   - Disabled buttons have aria-disabled attribute

3. **Color Contrast:**
   - Text colors meet WCAG AA standards
   - Success/error messages use color + icon for clarity
   - QR code has sufficient contrast

4. **Keyboard Navigation:**
   - All interactive elements are keyboard accessible
   - Tab order is logical
   - Enter key submits forms

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs (Clipboard API, QR code library)
- Fallback for clipboard: show selectable text field
- Graceful degradation if QR code library fails

---

## Migration Path

### Phase 1: Add New Component to PO Detail Page
- Create InvoiceUploadManager component
- Add "Upload Invoice" tab to PODetail
- Component is visible only for delivered POs
- Existing Invoice page remains unchanged

### Phase 2: Test and Validate
- Run unit tests for new component
- Run integration tests with API
- Test with real vendor upload portal
- Validate backward compatibility

### Phase 3: Remove from Invoice Page
- Remove UploadLinkGenerator component from Invoice page
- Remove upload link generation from Invoice page UI
- Update Invoice page tests
- Deprecate old component

### Phase 4: Monitor and Support
- Monitor error logs for issues
- Gather user feedback
- Fix bugs and edge cases
- Optimize performance if needed

---

## Dependencies

### External Libraries
- `qrcode.react`: QR code generation
- `react-hot-toast`: Toast notifications
- `lucide-react`: Icons
- `zustand`: State management (existing)

### Internal Dependencies
- `@/api/invoices`: Invoice API service
- `@/types`: TypeScript types
- `@/components/ui/*`: UI components
- `@/utils/formatDate`: Date formatting utility

---

## Future Enhancements

1. **Link Management Dashboard:**
   - View all generated links for a PO
   - Track which links have been used
   - Revoke links before expiration

2. **Bulk Link Generation:**
   - Generate links for multiple POs at once
   - Send to multiple vendors in batch

3. **Link Usage Analytics:**
   - Track when links are accessed
   - Track when invoices are uploaded via links
   - Generate reports on link usage

4. **Custom Email Templates:**
   - Allow customization of email content
   - Add company branding to emails
   - Support multiple languages

5. **SMS Notifications:**
   - Send upload link via SMS
   - Support for vendors without email

6. **Link Expiration Notifications:**
   - Send reminder emails before link expires
   - Allow extending link expiration

