# State Management Architecture

## Overview
The application uses a centralized state management approach with Zustand for global state and React Query for server state management.

## Store Structure

### 1. **useUIStore** (`src/store/useUIStore.ts`)
Manages UI-related global state with persistence.

**State:**
- `sidebarCollapsed`: Boolean for sidebar collapse state
- `theme`: 'dark' | 'light' theme preference
- `apiBaseUrl`: API base URL configuration
- `jwtSecret`: JWT secret for authentication

**Features:**
- Persisted to localStorage
- Theme toggle with DOM manipulation
- API configuration management

### 2. **usePOStore** (`src/store/usePOStore.ts`)
Manages Purchase Order creation form state.

**State:**
- `draftPO`: Partial PO data being edited
- `currentStep`: Current step in the multi-step form (0-3)
- `lineItems`: Array of line items in the PO

**Actions:**
- `updateDraftPO()`: Merge partial updates
- `nextStep()` / `prevStep()`: Navigate steps
- `addLineItem()` / `removeLineItem()` / `updateLineItem()`: Manage line items
- `resetDraft()`: Clear form and reset to step 0

### 3. **useFilterStore** (`src/store/useFilterStore.ts`) - NEW
Centralized filter and search state management for all list pages.

**State per Entity:**
- **Invoice Filters:**
  - `invoiceStatus`: Current status filter
  - `invoiceSearch`: Search query
  - `invoicePage`: Current page number

- **PO Filters:**
  - `poStatus`: Current status filter
  - `poSearch`: Search query
  - `poPage`: Current page number

- **Vendor Filters:**
  - `vendorSearch`: Search query
  - `vendorVerified`: Verification filter (true/false/null)
  - `vendorPage`: Current page number

- **Ticket Filters:**
  - `ticketStatus`: Current status filter
  - `ticketSearch`: Search query
  - `ticketPage`: Current page number

- **Payment Filters:**
  - `paymentSearch`: Search query
  - `paymentPage`: Current page number

**Features:**
- Persisted to localStorage
- Automatic page reset when search/filter changes
- Consistent API across all list pages

## Data Flow

### Server State (React Query)
```
API Call → useInvoices/usePurchaseOrders/etc. → Cache → Component
```

### Client State (Zustand)
```
User Action → Store Update → Component Re-render
```

### Combined Flow
```
User Changes Filter → useFilterStore Update → useInvoices Re-fetch → Component Update
```

## Usage Examples

### Using Filter Store in Components

```typescript
import { useFilterStore } from '@/store/useFilterStore';

function InvoiceList() {
  const {
    invoiceStatus,
    invoiceSearch,
    setInvoiceStatus,
    setInvoiceSearch,
    resetInvoiceFilters,
  } = useFilterStore();

  // Use in component
  const { data } = useInvoices({ 
    status: invoiceStatus || undefined 
  });

  // Update filters
  const handleStatusChange = (status) => {
    setInvoiceStatus(status);
  };

  const handleSearch = (query) => {
    setInvoiceSearch(query); // Automatically resets page to 1
  };

  const handleReset = () => {
    resetInvoiceFilters();
  };
}
```

### Using PO Store in Forms

```typescript
import { usePOStore } from '@/store/usePOStore';

function POCreate() {
  const {
    draftPO,
    currentStep,
    updateDraftPO,
    nextStep,
    prevStep,
    addLineItem,
  } = usePOStore();

  // Update form data
  const handleInputChange = (field, value) => {
    updateDraftPO({ [field]: value });
  };

  // Navigate steps
  const handleNext = () => {
    nextStep();
  };
}
```

## Benefits

1. **Persistence**: Filter state persists across page reloads
2. **Consistency**: All list pages follow the same pattern
3. **Performance**: Zustand is lightweight and efficient
4. **Scalability**: Easy to add new filters for new entities
5. **Maintainability**: Centralized state logic
6. **Type Safety**: Full TypeScript support

## Migration Guide

### Before (Local useState)
```typescript
const [selectedStatus, setSelectedStatus] = useState('');
const [searchQuery, setSearchQuery] = useState('');
```

### After (useFilterStore)
```typescript
const { invoiceStatus, invoiceSearch, setInvoiceStatus, setInvoiceSearch } = useFilterStore();
```

## Future Improvements

1. Add pagination state management
2. Add sorting preferences
3. Add saved filter presets
4. Add filter history
5. Add bulk action state management
