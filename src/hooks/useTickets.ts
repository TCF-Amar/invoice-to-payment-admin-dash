import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/api/tickets';
import { CreateTicketPayload, TicketStatus, TicketPriority } from '@/types';
import toast from 'react-hot-toast';

export const useTickets = (params?: { status?: TicketStatus; priority?: TicketPriority; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketService.list(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: () => {
      toast.error('Failed to create ticket');
    },
  });
};

export const useUpdateTicket = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { status?: TicketStatus; priority?: TicketPriority }) =>
      ticketService.updateTicket(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket updated');
    },
    onError: () => {
      toast.error('Failed to update ticket');
    },
  });
};

export const useUpdateTicketStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, reason }: { status: TicketStatus; reason?: string }) =>
      ticketService.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket status updated');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update ticket status';
      toast.error(message);
    },
  });
};


