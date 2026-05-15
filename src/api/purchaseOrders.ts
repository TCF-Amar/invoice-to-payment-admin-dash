import api from './client';
import { PurchaseOrder, CreatePOPayload, PaginatedResponse, POStatus } from '@/types';

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
  // If data has pos property, map it to items
  if (data?.pos && Array.isArray(data.pos)) {
    return {
      items: data.pos,
      total: data.total || data.pos.length,
      page: data.page || 1,
      limit: data.limit || data.pos.length,
      pages: data.totalPages || data.pages || 1,
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

export const poService = {
  list: async (params?: { status?: POStatus; vendorId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<PurchaseOrder>> => {
    const response = await api.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders', { params });
    return toPaginatedResponse(response as unknown as PaginatedResponse<PurchaseOrder> | PurchaseOrder[]);
  },

  getById: async (id: string) => {
    const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return response as unknown as PurchaseOrder;
  },

  getByNumber: async (poNumber: string) => {
    const response = await api.get<PurchaseOrder>(`/purchase-orders/by-number/${poNumber}`);
    return response as unknown as PurchaseOrder;
  },

  getVendorSync: async (vendorId: string) => {
    const response = await api.get<{ pos: PurchaseOrder[]; summary: Record<POStatus, number> }>(
      `/purchase-orders/vendor-sync/${vendorId}`
    );
    return response as unknown as { pos: PurchaseOrder[]; summary: Record<POStatus, number> };
  },

  create: async (payload: CreatePOPayload) => {
    const response = await api.post<PurchaseOrder>('/purchase-orders', payload);
    return response as unknown as PurchaseOrder;
  },

  update: async (id: string, payload: Partial<CreatePOPayload>) => {
    const response = await api.patch<PurchaseOrder>(`/purchase-orders/${id}`, payload);
    return response as unknown as PurchaseOrder;
  },

  updateStatus: async (id: string, status: POStatus, reason?: string, actor?: string) => {
    const response = await api.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, {
      status,
      reason,
      actor,
    });
    return response as unknown as PurchaseOrder;
  },

  submit: async (id: string) => {
    const response = await api.patch<PurchaseOrder>(`/purchase-orders/${id}/submit`, {});
    return response as unknown as PurchaseOrder;
  },

  approve: async (id: string, actor?: string) => {
    const response = await api.patch<PurchaseOrder>(`/purchase-orders/${id}/approve`, { actor });
    return response as unknown as PurchaseOrder;
  },

  reject: async (id: string, reason: string, actor?: string) => {
    const response = await api.patch<PurchaseOrder>(`/purchase-orders/${id}/reject`, { reason, actor });
    return response as unknown as PurchaseOrder;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/purchase-orders/${id}`);
    return response;
  },
};
