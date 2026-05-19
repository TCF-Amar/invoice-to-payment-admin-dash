import api from './client';
import { Invoice, CreateInvoicePayload, PaginatedResponse, InvoiceStatus, UploadToken, SendUploadLinkPayload, GeneratedLinkMetadata, InvoiceUploadResponse } from '@/types';

// Helper to convert array response to paginated format
const toPaginatedResponse = <T,>(data: T[] | PaginatedResponse<T> | any): PaginatedResponse<T> => {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      limit: data.length,
      pages: 1,
    } as PaginatedResponse<T>;
  }
  // If data has invoices property, map it to items
  if (data?.invoices && Array.isArray(data.invoices)) {
    return {
      items: data.invoices,
      total: data.total || data.invoices.length,
      page: data.page || 1,
      limit: data.limit || data.invoices.length,
      pages: data.pages || 1,
    } as PaginatedResponse<T>;
  }
  return data as PaginatedResponse<T>;
};

export const invoiceService = {
  list: async (params?: { status?: InvoiceStatus; vendorId?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return toPaginatedResponse(response as unknown as PaginatedResponse<Invoice> | Invoice[]);
  },

  getById: async (id: string) => {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response as unknown as Invoice;
  },

  getByNumber: async (invoiceNumber: string) => {
    const response = await api.get<Invoice>(`/invoices/by-number/${invoiceNumber}`);
    return response as unknown as Invoice;
  },

  getApprovedUnpaid: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Invoice>>('/invoices/approved-unpaid', { params });
    return toPaginatedResponse(response as unknown as PaginatedResponse<Invoice> | Invoice[]);
  },

  checkDuplicate: async (invoiceNumber: string) => {
    const response = await api.get<{ isDuplicate: boolean }>(`/invoices/duplicate/${invoiceNumber}`);
    console.log(response);
    
    return response as unknown as { isDuplicate: boolean };
  },

  create: async (payload: CreateInvoicePayload) => {
    const response = await api.post<Invoice>('/invoices', payload);
    return response as unknown as Invoice;
  },

  update: async (id: string, payload: Partial<CreateInvoicePayload>) => {
    const response = await api.patch<Invoice>(`/invoices/${id}`, payload);
    return response as unknown as Invoice;
  },

  updateStatus: async (id: string, status: InvoiceStatus, rejectionReason?: string) => {
    const response = await api.patch<Invoice>(`/invoices/${id}/status`, {
      status,
      rejectionReason,
    });
    return response as unknown as Invoice;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response;
  },

  // Upload link management
  generateUploadLink: async (payload: SendUploadLinkPayload) => {
    const response = await api.post<GeneratedLinkMetadata>('/invoices/upload-links/generate', payload);
    console.log(response);
    
    return response as unknown as GeneratedLinkMetadata;
  },

  sendUploadLink: async (payload: SendUploadLinkPayload) => {
    const response = await api.post('/invoices/upload-links/send', payload);
    return response;
  },

  validateUploadToken: async (token: string) => {
    const response = await api.get<UploadToken>(`/invoices/upload-links/validate/${token}`);
    return response as unknown as UploadToken;
  },

  uploadInvoice: async (formData: FormData) => {
    const response = await api.post<InvoiceUploadResponse>('/invoices/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response as unknown as InvoiceUploadResponse;
  },
};
