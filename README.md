# Invoice Portal — v1

A production-grade invoice-to-payment management dashboard built with React 18, TypeScript, and Tailwind CSS v4.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v4 (dark mode default) |
| Build | Vite + Bun |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios with interceptors |
| Animations | Framer Motion |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Dates | date-fns |

---

## Project Structure

```
src/
├── api/                    # Axios service modules
│   ├── client.ts           # Base Axios instance + interceptors
│   ├── invoices.ts
│   ├── payments.ts
│   ├── payouts.ts
│   ├── purchaseOrders.ts
│   ├── tickets.ts
│   └── vendors.ts
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── invoice-upload/
│   │   ├── GeneratedLinkDisplay.tsx
│   │   ├── InvoiceUploadManager.tsx
│   │   └── UploadLinkForm.tsx
│   ├── forms/
│   │   └── VendorForm.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── DrawerPanel.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── Modal.tsx
│       ├── PageHeader.tsx
│       ├── PaymentButton.tsx
│       ├── PaymentConfirmationModal.tsx
│       ├── PayoutButton.tsx
│       ├── SearchInput.tsx
│       ├── Stepper.tsx
│       ├── Tabs.tsx
│       └── Timeline.tsx
│
├── hooks/                  # React Query hooks
│   ├── useInvoices.ts
│   ├── usePayments.ts
│   ├── usePayouts.ts
│   ├── usePurchaseOrders.ts
│   ├── useTickets.ts
│   ├── useUploadLink.ts
│   └── useVendors.ts
│
├── pages/
│   ├── Dashboard.tsx
│   ├── invoices/
│   │   ├── InvoiceDetail.tsx
│   │   ├── InvoiceList.tsx
│   │   ├── UploadLinkGenerator.tsx
│   │   └── VendorUpload.tsx
│   ├── purchase-orders/
│   │   ├── POCreate.tsx
│   │   ├── PODetail.tsx
│   │   ├── POEdit.tsx          ← new
│   │   └── POList.tsx
│   ├── payouts/
│   │   └── PayoutDashboard.tsx
│   ├── tickets/
│   │   ├── TicketDetail.tsx
│   │   └── TicketList.tsx
│   ├── vendors/
│   │   ├── VendorDetail.tsx
│   │   └── VendorList.tsx
│   └── settings/
│       └── Settings.tsx
│
├── store/
│   ├── useFilterStore.ts
│   ├── usePOStore.ts
│   └── useUIStore.ts
│
├── types/
│   └── index.ts
│
├── utils/
│   ├── cn.ts
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   ├── generateUploadToken.ts
│   ├── statusColors.ts
│   └── uploadLinkUtils.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Install

```bash
bun install
# or
npm install
```

### Dev server

```bash
bun run dev
# or
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
bun run build
```

### Tests

```bash
bun run test:run
```

---

## Configuration

### API Base URL

Set in the Settings page, or directly:

```js
localStorage.setItem('api_base_url', 'http://your-api.com/api/v1');
```

Default: `http://localhost:3000/api/v1`

### API Key

Hardcoded in `src/api/client.ts` via the `x-api-key` header. Update there for your environment.

---

## Features

### Dashboard
- KPI cards (vendors, open POs, pending invoices, total payouts)
- Quick navigation to key sections

### Vendors
- List, search, filter by verification status
- Create / edit vendor details
- Stripe onboarding status per vendor

### Purchase Orders
- 4-step creation wizard (vendor → details → line items → review)
- **Edit draft POs** — full edit form available while status is `draft`
- Status lifecycle: draft → pending_approval → approved → open → partial → delivered → closed / cancelled
- Approve / reject / submit for approval
- Line item management with auto-calculated totals and tax

### Invoices
- List with status filter and search
- Detail view with vendor and PO cross-links
- Manual approve / reject with reason capture
- Duplicate detection badge
- **Pay button** — triggers payment via `/payments` for `approved` invoices
- **Payout button** — triggers Stripe vendor payout via `/payouts/trigger` for `approved` / `paid` invoices
- Secure upload link generation (JWT-signed, QR code)
- Vendor-facing upload portal (`/upload-invoice`)

### Payments
- Optimistic status update on payment initiation
- Rollback on failure
- Confirmation modal before processing

### Stripe Payouts
- Per-invoice payout from invoice list and detail pages
- Bulk payout from Payout Dashboard
- Vendor Stripe onboarding flow

### Tickets
- Create, list, filter by status and priority
- Detail view with status / priority updates
- Timeline of ticket activity

### Settings
- API base URL configuration
- JWT secret for upload link signing
- Theme toggle (dark / light)

---

## API Contract

Expected base response envelope:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { }
}
```

The Axios interceptor in `client.ts` unwraps `data.data` automatically.

### Key endpoints used

```
POST   /payments                        Create payment
POST   /payouts/trigger                 Create vendor payout

GET    /invoices                        List invoices
GET    /invoices/:id                    Invoice detail
PATCH  /invoices/:id/status             Update invoice status

GET    /purchase-orders                 List POs
GET    /purchase-orders/:id             PO detail
POST   /purchase-orders                 Create PO
PATCH  /purchase-orders/:id             Update PO (edit draft)
PATCH  /purchase-orders/:id/status      Update PO status
PATCH  /purchase-orders/:id/submit      Submit for approval
PATCH  /purchase-orders/:id/approve     Approve PO
PATCH  /purchase-orders/:id/reject      Reject PO

GET    /vendors                         List vendors
POST   /vendors                         Create vendor
PATCH  /vendors/:id                     Update vendor

GET    /tickets                         List tickets
PATCH  /tickets/:id                     Update ticket

POST   /payouts/stripe/setup-vendor     Stripe onboarding
GET    /payouts/stripe/status/:vendorId Stripe account status
```

---

## Design System

| Token | Value |
|---|---|
| Background | `#0A0C10` |
| Surface | `#111318` |
| Primary | `#6366F1` (Indigo) |
| Success | `#10B981` (Emerald) |
| Warning | `#F59E0B` (Amber) |
| Error | `#F43F5E` (Rose) |
| Text primary | `text-slate-100` |
| Text muted | `text-slate-400` |

---

## State Management

**Zustand stores**

| Store | Responsibility |
|---|---|
| `useUIStore` | Sidebar collapse, theme, API URL, JWT secret |
| `usePOStore` | Draft PO form state and step tracking |
| `useFilterStore` | List filters and search terms (persisted) |

**TanStack Query**
- Stale time: 5 min
- Cache time: 10 min
- Optimistic updates on payment mutations with rollback on error

---

## Changelog

### v1 (current)
- Removed auth / role-based access — all users have full access
- Added **Edit** for draft POs (`/purchase-orders/:id/edit`)
- Added **Payout button** on invoice list rows and invoice detail page
- `PaymentButton` no longer requires a `userRole` prop
- Fixed `usePayments` success toast crash when API response omits `amount`
- Added JSDoc comments to `cn` utility
