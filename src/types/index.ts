// Domain Types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gstin?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  isVerified: boolean;
  stripeAccountId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface POLineItem {
  id?: string;
  poId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export type POStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'open' | 'partial' | 'delivered' | 'closed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor?: Vendor;
  approvedAmount: number;
  remainingAmount: number;
  taxRate?: number;
  taxAmount?: number;
  currency: string;
  description?: string;
  status: POStatus;
  deliveryDate?: string;
  createdAt: string;
  updatedAt?: string;
  lineItems: POLineItem[];
  invoices?: Invoice[];
  auditLogs?: AuditLog[];
}

export type InvoiceStatus = 'received' | 'processing' | 'validated' | 'review_pending' | 'approved' | 'rejected' | 'paid' | 'duplicate' | 'failed';

export interface InvoiceLineItem {
  id?: string;
  invoiceId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string;
  vendorId: string;
  vendor?: Vendor;
  vendorName?: string;
  vendorEmail?: string;
  totalAmount: number;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  currency: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems: InvoiceLineItem[];
  rejectionReason?: string;
  isDuplicate?: boolean;
  createdAt: string;
  updatedAt?: string;
  auditLogs?: AuditLog[];
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  vendorId?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  actor?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface StripePayoutStatus {
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  accountId?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Form Payloads
export interface CreateVendorPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gstin?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
}

export type UpdateVendorPayload = Partial<CreateVendorPayload>;

export interface CreatePOPayload {
  poNumber: string;
  vendorId?: string;
  vendor?: CreateVendorPayload;
  approvedAmount: number;
  taxRate?: number;
  taxAmount?: number;
  currency: string;
  description?: string;
  lineItems: POLineItem[];
  deliveryDate?: string;
  status?: POStatus;
}

export interface CreateInvoicePayload {
  invoiceNumber: string;
  poNumber?: string;
  vendorId: string;
  totalAmount: number;
  amountDue: number;
  currency: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems: InvoiceLineItem[];
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  vendorId?: string;
  invoiceId?: string;
  priority: TicketPriority;
}

export interface UploadTokenPayload {
  vendorEmail?: string;
  poNumber?: string;
  expiresIn: '1h' | '24h' | '7d';
}

export interface UploadToken {
  id: string;
  token: string;
  vendorEmail: string;
  vendorId?: string;
  poNumber?: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
}

export interface InvoiceUploadResponse {
  fileName: string;
  mimetype: string;
  size: number;
  n8nStatus: {
    sent: boolean;
    response?: unknown;
    error?: unknown;
  };
}

export interface SendUploadLinkPayload {
  uploadUrl: string;
  vendorEmail: string;
  poNumber?: string;
  expiresIn: '1h' | '24h' | '7d';
}

// Upload Link Component Types
export interface UploadLinkFormData {
  vendorEmail: string;
  poNumber: string;
  expiresIn: '1h' | '24h' | '7d';
}

// expect responce 

export interface GeneratedLinkMetadata {
  token: string;
  url: string;
  expiresAt: string;
  createdAt: string;
  vendorEmail: string;
  poNumber?: string;
}

export interface UploadLinkState {
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
