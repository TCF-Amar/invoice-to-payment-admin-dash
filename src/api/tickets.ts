import api from './client';
import { Ticket, CreateTicketPayload, PaginatedResponse, TicketStatus, TicketPriority } from '@/types';

// Helper to convert array response to paginated format
type PaginatedInput<T> = T[] | PaginatedResponse<T> | {
  tickets?: T[];
  invoices?: T[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  totalPages?: number;
};

const toPaginatedResponse = <T,>(data: PaginatedInput<T>): PaginatedResponse<T> => {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      limit: data.length,
      pages: 1,
    } as PaginatedResponse<T>;
  }

  const d = data as {
    tickets?: T[];
    invoices?: T[];
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    totalPages?: number;
    items?: T[];
  };

  // If data has tickets or invoices property, map it to items
  const items = d.tickets || d.invoices || d.items;
  if (items && Array.isArray(items)) {
    return {
      items: items,
      total: d.total || items.length,
      page: d.page || 1,
      limit: d.limit || items.length,
      pages: d.totalPages || d.pages || 1,
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



  updateTicket: async (id: string, updates: { status?: TicketStatus; priority?: TicketPriority }) => {
    const response = await api.patch<Ticket>(`/tickets/${id}`, updates);
    return response as unknown as Ticket;
  },

  updateStatus: async (id: string, status: TicketStatus, reason?: string) => {
    const response = await api.patch<Ticket>(`/tickets/${id}/status`, { status, reason });
    return response as unknown as Ticket;
  },



  // updatePriority: async (id: string, priority: TicketPriority,status: TicketStatus) => {
  //   const response = await api.patch<Ticket>(`/tickets/${id}`, { priority, status });
  //   return response as unknown as Ticket;
  // }, 
};
