# Invoice-to-Payment Management System

A complete, production-grade frontend for managing invoices, purchase orders, vendors, and payments.

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** (dark mode by default)
- **Axios** with interceptors
- **React Router v6** for navigation
- **Zustand** for state management
- **React Query (TanStack Query v5)** for server state
- **React Hook Form + Zod** for validation
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **date-fns** for date formatting

## Project Structure

```
src/
├── api/                    # API services
│   ├── client.ts          # Axios instance with interceptors
│   ├── vendors.ts
│   ├── purchaseOrders.ts
│   ├── invoices.ts
│   ├── payments.ts
│   ├── payouts.ts
│   └── tickets.ts
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── DrawerPanel.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Tabs.tsx
│   │   ├── Timeline.tsx
│   │   ├── Stepper.tsx
│   │   └── PageHeader.tsx
│   └── layout/            # Layout components
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       └── AppLayout.tsx
├── hooks/                 # React Query hooks
│   ├── useVendors.ts
│   ├── usePurchaseOrders.ts
│   ├── useInvoices.ts
│   ├── usePayments.ts
│   ├── usePayouts.ts
│   └── useTickets.ts
├── pages/                 # Page components
│   ├── Dashboard.tsx
│   ├── vendors/
│   ├── purchase-orders/
│   ├── invoices/
│   ├── payments/
│   ├── payouts/
│   ├── tickets/
│   └── settings/
├── store/                 # Zustand stores
│   ├── useUIStore.ts
│   └── usePOStore.ts
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
│   ├── cn.ts
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   ├── generateUploadToken.ts
│   └── statusColors.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Development

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

The app will open at `http://localhost:5173`

### Build

```bash
# Using Bun
bun run build

# Or using npm
npm run build
```

## Configuration

### API Base URL

Set your API base URL in Settings page or via localStorage:

```javascript
localStorage.setItem('api_base_url', 'http://your-api.com/api/v1');
```

### JWT Secret

For secure upload link generation, set JWT secret in Settings:

```javascript
localStorage.setItem('jwt_secret', 'your-secret-key');
```

## Features

### Dashboard
- KPI cards with real-time metrics
- Invoice approval queue
- Quick action buttons
- Recent activity feed

### Vendors
- List, search, and filter vendors
- Vendor detail view
- Create/edit vendor information
- Stripe onboarding status

### Purchase Orders
- Create multi-step POs
- Status tracking and lifecycle management
- Line items management
- Approval workflow

### Invoices
- Upload and manage invoices
- Duplicate detection
- Status tracking
- Invoice preview with line items
- Secure upload link generation

### Payments
- Payment tracking
- Status management
- Payment history

### Stripe Payouts
- Vendor onboarding
- Single and bulk payouts
- Payout status tracking

### Tickets
- Support ticket management
- Priority and status tracking
- Ticket details view

### Settings
- API configuration
- JWT secret management
- Theme toggle

## Design System

### Colors
- **Background**: `#0A0C10`
- **Surface**: `#111318`
- **Primary**: `#6366F1` (Indigo)
- **Success**: `#10B981` (Emerald)
- **Error**: `#F43F5E` (Rose)

### Typography
- **Font**: Inter (Google Fonts)
- **Primary Text**: `text-slate-100`
- **Muted Text**: `text-slate-400`

### Components
- Rounded corners: `rounded-2xl`
- Borders: `border-white/5`
- Shadows: `shadow-2xl`
- Glassmorphism: `backdrop-blur-md bg-white/5`

## API Integration

The app expects a backend API with the following structure:

```
Base URL: http://localhost:3000/api/v1

Response Format:
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

See the specification in the project for detailed API endpoints.

## State Management

### Zustand Stores

**useUIStore**
- `sidebarCollapsed`: Toggle sidebar state
- `theme`: Dark/light mode
- `apiBaseUrl`: API configuration
- `jwtSecret`: JWT secret for upload links

**usePOStore**
- `draftPO`: Draft purchase order state
- `currentStep`: Multi-step form progress
- `lineItems`: PO line items management

## React Query Configuration

- **Stale Time**: 5 minutes
- **Cache Time**: 10 minutes
- **Refetch Interval**: 30 seconds (for KPIs)

## Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K`: Global search (coming soon)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Support

For issues or questions, please create a support ticket in the app.
