import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/api/tickets';
import { Ticket, CreateTicketPayload, TicketStatus, TicketPriority } from '@/types';
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

export const useUpdateTicketStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TicketStatus) => ticketService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket status updated');
    },
    onError: () => {
      toast.error('Failed to update ticket status');
    },
  });
};

export const useUpdateTicketPriority = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priority: TicketPriority) => ticketService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket priority updated');
    },
    onError: () => {
      toast.error('Failed to update ticket priority');
    },
  });
};
