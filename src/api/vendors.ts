import api from './client';
import { Vendor, CreateVendorPayload, UpdateVendorPayload, PaginatedResponse } from '@/types';

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
  // If data has vendors property, map it to items
  if (data?.vendors && Array.isArray(data.vendors)) {
    return {
      items: data.vendors,
      total: data.total || data.vendors.length,
      page: data.page || 1,
      limit: data.limit || data.vendors.length,
      pages: data.pages || 1,
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

export const vendorService = {
  list: async (params?: { search?: string; isVerified?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<Vendor>> => {
    const response = await api.get<PaginatedResponse<Vendor>>('/vendors', { params });
    return toPaginatedResponse(response as unknown as PaginatedResponse<Vendor> | Vendor[]);
  },

  getById: async (id: string) => {
    const response = await api.get<Vendor>(`/vendors/${id}`);
    return response as unknown as Vendor;
  },

  getByName: async (name: string) => {
    const response = await api.get<Vendor>(`/vendors/by-name/${name}`);
    return response as unknown as Vendor;
  },

  getByEmail: async (email: string) => {
    const response = await api.get<Vendor>(`/vendors/by-email/${email}`);
    return response as unknown as Vendor;
  },

  create: async (payload: CreateVendorPayload) => {
    const response = await api.post<Vendor>('/vendors', payload);
    return response as unknown as Vendor;
  },

  update: async (id: string, payload: UpdateVendorPayload) => {
    const response = await api.patch<Vendor>(`/vendors/${id}`, payload);
    return response as unknown as Vendor;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vendors/${id}`);
    return response;
  },
};
