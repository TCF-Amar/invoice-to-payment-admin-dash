import api from './client';
import { Ticket, CreateTicketPayload, PaginatedResponse, TicketStatus, TicketPriority } from '@/types';

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

export const ticketService = {
  list: async (params?: { status?: TicketStatus; priority?: TicketPriority; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Ticket> | Ticket[]>('/tickets', { params });
    return toPaginatedResponse(response as unknown as PaginatedResponse<Ticket> | Ticket[]);
  },

  getById: async (id: string) => {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response as unknown as Ticket;
  },

  create: async (payload: CreateTicketPayload) => {
    const response = await api.post<Ticket>('/tickets', payload);
    return response as unknown as Ticket;
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    const response = await api.patch<Ticket>(`/tickets/${id}`, { status });
    return response as unknown as Ticket;
  },

  updatePriority: async (id: string, priority: TicketPriority) => {
    const response = await api.patch<Ticket>(`/tickets/${id}`, { priority });
    return response as unknown as Ticket;
  },
};
