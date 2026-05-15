# Invoice-to-Payment Dashboard - Complete Project Context

## 📋 Project Overview

**Name:** Invoice Portal  
**Type:** Full-stack Invoice Management & Payment Processing Dashboard  
**Tech Stack:** React 18 + TypeScript + Tailwind CSS v4.3 + Vite + Bun  
**Status:** ✅ Production Ready  
**Build Size:** 750.73 kB (224.06 kB gzipped)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 18.x |
| **Language** | TypeScript | 5.x |
| **Build Tool** | Vite | 8.x |
| **Package Manager** | Bun | Latest |
| **Styling** | Tailwind CSS | 4.3 |
| **State Management** | Zustand | Latest |
| **Data Fetching** | React Query | Latest |
| **Form Validation** | React Hook Form + Zod | Latest |
| **Routing** | React Router | 6.x |
| **Animations** | Framer Motion | Latest |
| **Icons** | Lucide React | Latest |
| **Notifications** | React Hot Toast | Latest |
| **QR Codes** | qrcode.react | Latest |

### Design System

- **Color Scheme:** Dark mode by default
- **Primary Color:** Indigo (#6366F1)
- **Background:** Deep dark (#0A0C10)
- **Surface:** Dark surface (#111318)
- **Status Colors:** 
  - Success: Emerald (#10B981)
  - Warning: Amber (#F59E0B)
  - Error: Rose (#F43F5E)
  - Info: Sky (#0EA5E9)

---

## 📁 Project Structure

```
invoice-portal/
├── src/
│   ├── api/                    # API services layer
│   │   ├── client.ts          # Axios HTTP client
│   │   ├── invoices.ts        # Invoice API endpoints
│   │   ├── vendors.ts         # Vendor API endpoints
│   │   ├── purchaseOrders.ts  # PO API endpoints
│   │   ├── payouts.ts         # Payout API endpoints
│   │   └── tickets.ts         # Ticket API endpoints
│   │
│   ├── components/            # Reusable UI components
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx  # Main layout wrapper
│   │   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   │   └── TopBar.tsx     # Top navigation bar
│   │   ├── ui/                # UI component library
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── DrawerPanel.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   └── forms/
│   │       └── VendorForm.tsx
│   │
│   ├── hooks/                 # React Query hooks
│   │   ├── useInvoices.ts
│   │   ├── useVendors.ts
│   │   ├── usePurchaseOrders.ts
│   │   ├── usePayouts.ts
│   │   └── useTickets.ts
│   │
│   ├── pages/                 # Page components
│   │   ├── Dashboard.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceDetail.tsx
│   │   │   ├── InvoiceUpload.tsx
│   │   │   ├── UploadLinkGenerator.tsx
│   │   │   └── VendorUpload.tsx
│   │   ├── purchase-orders/
│   │   │   ├── POList.tsx
│   │   │   ├── POCreate.tsx
│   │   │   └── PODetail.tsx
│   │   ├── vendors/
│   │   │   ├── VendorList.tsx
│   │   │   └── VendorDetail.tsx
│   │   ├── payouts/
│   │   │   └── PayoutDashboard.tsx
│   │   ├── tickets/
│   │   │   ├── TicketList.tsx
│   │   │   └── TicketDetail.tsx
│   │   └── settings/
│   │       └── Settings.tsx
│   │
│   ├── store/                 # Zustand state management
│   │   ├── useUIStore.ts      # UI state (sidebar, theme, config)
│   │   ├── usePOStore.ts      # PO form state
│   │   └── useFilterStore.ts  # List filters & search state
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   ├── statusColors.ts
│   │   ├── generateUploadToken.ts
│   │   └── cn.ts
│   │
│   ├── assets/                # Static assets
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
│
├── public/                    # Static files
├── dist/                      # Build output
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── tailwind.config.js
├── eslint.config.js
└── README.md
```

---

## 🔄 Data Flow Architecture

### API Layer
- **Client:** Axios-based HTTP client with base URL configuration
- **Services:** Modular API services for each entity (invoices, vendors, POs, etc.)
- **Response Normalization:** `toPaginatedResponse()` helper normalizes inconsistent API responses

### State Management

#### 1. **Server State (React Query)**
- Handles all API data fetching and caching
- Automatic refetching and invalidation
- Optimistic updates for mutations
- Stale time: 5 minutes
- Cache time: 10 minutes

#### 2. **Client State (Zustand)**

**useUIStore:**
- Sidebar collapse state
- Theme preference (dark/light)
- API base URL configuration
- JWT secret configuration
- Persisted to localStorage

**usePOStore:**
- Draft PO form data
- Current step in multi-step form
- Line items management
- Form reset functionality

**useFilterStore:**
- Invoice filters (status, search, page)
- PO filters (status, search, page)
- Vendor filters (search, verified toggle, page)
- Ticket filters (status, search, page)
- Persisted to localStorage

### Component State (React)
- Local UI state (modals, dropdowns, loading states)
- Form state (React Hook Form)
- Temporary UI interactions

---

## 📊 Core Features

### 1. **Dashboard**
- KPI cards (vendors, open POs, pending invoices, total payouts)
- Quick stats and overview
- Navigation to key sections

### 2. **Vendor Management**
- ✅ List vendors with search and verification filter
- ✅ Create/edit/delete vendors
- ✅ View vendor details
- ✅ Drawer panel for quick actions
- ✅ Stripe account status tracking

### 3. **Purchase Orders (POs)**
- ✅ Create POs with 4-step form (details, line items, review, submit)
- ✅ List POs with status filtering and search
- ✅ View PO details with status management
- ✅ Approve/reject POs
- ✅ Track PO status lifecycle
- ✅ Line item management

### 4. **Invoice Management**
- ✅ Upload invoices (drag-drop, file select, 3-step form)
- ✅ List invoices with status filtering and search
- ✅ View invoice details with vendor & PO information
- ✅ Manual review & approval workflow
- ✅ Rejection with reason capture
- ✅ Duplicate detection
- ✅ Status-based filtering (received, processing, validated, review_pending, approved, rejected, paid, duplicate, failed)
- ✅ Secure upload link generation with JWT tokens
- ✅ QR code for upload links
- ✅ Vendor-specific upload portal

### 5. **Payout Management**
- ✅ Stripe vendor onboarding
- ✅ Individual payout creation
- ✅ Bulk payout with "Select All" option
- ✅ Vendor Stripe status tracking
- ✅ Payout history and status

### 6. **Ticket Management**
- ✅ Create support tickets
- ✅ List tickets with status and priority filtering
- ✅ View ticket details
- ✅ Update ticket status and priority
- ✅ Timeline view of ticket activity

### 7. **Settings**
- ✅ API URL configuration
- ✅ JWT secret configuration
- ✅ Persistent configuration storage

---

## 🔐 Security Features

- **JWT Authentication:** Token-based API authentication
- **Secure Upload Links:** JWT-signed upload tokens with expiration
- **Input Validation:** Zod schema validation on all forms
- **CORS Handling:** Configured API client
- **Secure Configuration:** Sensitive data stored in localStorage with user control

---

## 🎨 UI/UX Features

### Responsive Design
- Desktop-first approach
- Sidebar collapses to bottom nav on mobile (<768px)
- Responsive tables with horizontal scroll
- Mobile-optimized modals and forms

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Focus management in modals

### User Experience
- Loading skeletons for better perceived performance
- Empty states with helpful messages
- Toast notifications for feedback
- Smooth page transitions with Framer Motion
- Optimistic updates for instant feedback
- Confirmation modals for destructive actions
- Back buttons on all detail pages

---

## 📈 Performance Optimizations

- **Code Splitting:** Lazy-loaded routes
- **Caching:** React Query with 5-min stale time
- **Memoization:** React.memo for expensive components
- **Bundle Size:** 750.73 kB (224.06 kB gzipped)
- **Build Time:** ~1.5 seconds

---

## 🔄 Recent Updates

### Latest Changes
1. ✅ Added `review_pending` invoice status
2. ✅ Fixed state management with centralized Zustand stores
3. ✅ Added back buttons to all detail pages
4. ✅ Added "Select All" option to bulk payments
5. ✅ Removed payment page (consolidated into payouts)
6. ✅ Fixed TypeScript configuration
7. ✅ Improved filter persistence across navigation

---

## 🚀 Development Workflow

### Commands
```bash
# Install dependencies
bun install

# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

### Development Guidelines
- Use TypeScript for type safety
- Follow component composition patterns
- Use Zustand for global state
- Use React Query for server state
- Use React Hook Form + Zod for forms
- Add loading states to all async operations
- Use toast notifications for user feedback
- Test on mobile and desktop

---

## 📝 Type System

### Core Types

**Invoice**
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string;
  vendorId: string;
  totalAmount: number;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  currency: string;
  lineItems: InvoiceLineItem[];
  rejectionReason?: string;
  isDuplicate?: boolean;
  createdAt: string;
}
```

**PurchaseOrder**
```typescript
interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  approvedAmount: number;
  remainingAmount: number;
  currency: string;
  status: POStatus;
  lineItems: POLineItem[];
  createdAt: string;
}
```

**Vendor**
```typescript
interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gstin?: string;
  isVerified: boolean;
  stripeAccountId?: string;
  createdAt: string;
}
```

---

## 🔗 API Integration

### Base Configuration
- **Client:** Axios with interceptors
- **Base URL:** Configurable via settings (default: `http://localhost:3000/api/v1`)
- **Authentication:** JWT token in Authorization header
- **Response Format:** Paginated responses with `items`, `total`, `page`, `limit`, `pages`

### Endpoints Pattern
```
GET    /invoices              - List invoices
GET    /invoices/:id          - Get invoice detail
POST   /invoices              - Create invoice
PATCH  /invoices/:id          - Update invoice
DELETE /invoices/:id          - Delete invoice

GET    /vendors               - List vendors
GET    /vendors/:id           - Get vendor detail
POST   /vendors               - Create vendor
PATCH  /vendors/:id           - Update vendor
DELETE /vendors/:id           - Delete vendor

GET    /purchase-orders       - List POs
GET    /purchase-orders/:id   - Get PO detail
POST   /purchase-orders       - Create PO
PATCH  /purchase-orders/:id   - Update PO
DELETE /purchase-orders/:id   - Delete PO

POST   /payouts              - Create payout
POST   /payouts/bulk         - Create bulk payout
GET    /payouts/status       - Get payout status

GET    /tickets              - List tickets
GET    /tickets/:id          - Get ticket detail
POST   /tickets              - Create ticket
PATCH  /tickets/:id          - Update ticket
```

---

## 🧪 Testing Strategy

### Current Status
- ✅ Build verification
- ✅ TypeScript type checking
- ✅ ESLint code quality

### Recommended Testing
- Unit tests for utilities
- Component tests for UI components
- Integration tests for API flows
- E2E tests for critical workflows

---

## 📚 Documentation Files

- **STATE_MANAGEMENT.md** - Detailed state management architecture
- **PROJECT_CONTEXT.md** - This file
- **README.md** - Project setup and overview

---

## 🎯 Future Enhancements

1. **Advanced Filtering**
   - Date range filters
   - Amount range filters
   - Multi-status selection

2. **Reporting**
   - Invoice aging report
   - Payment status report
   - Vendor performance metrics

3. **Automation**
   - Scheduled payouts
   - Auto-approval rules
   - Duplicate detection improvements

4. **Integration**
   - Stripe webhook handling
   - Email notifications
   - Accounting software integration

5. **Performance**
   - Virtual scrolling for large lists
   - Progressive image loading
   - Service worker caching

---

## 🐛 Known Issues & Limitations

- Bundle size warning (>500kB) - Consider code splitting
- No offline support yet
- Limited to single-user per session
- No audit logging UI

---

## 📞 Support & Maintenance

### Build Status
- ✅ TypeScript compilation: Passing
- ✅ Vite build: Passing
- ✅ Bundle size: 750.73 kB (224.06 kB gzipped)
- ✅ Module count: 2743 modules

### Last Updated
- Date: May 15, 2026
- Changes: Complete project context documentation

---

## 📋 Checklist for New Developers

- [ ] Read this PROJECT_CONTEXT.md
- [ ] Read STATE_MANAGEMENT.md
- [ ] Install dependencies: `bun install`
- [ ] Start dev server: `bun run dev`
- [ ] Explore the codebase structure
- [ ] Review the type definitions
- [ ] Check the API integration patterns
- [ ] Understand the state management approach
- [ ] Review existing components
- [ ] Test the application locally

---

**Project maintained with ❤️ using React, TypeScript, and Tailwind CSS**
