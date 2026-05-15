import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InvoiceStatus, POStatus, TicketStatus } from '@/types';

interface FilterState {
  // Invoice filters
  invoiceStatus: InvoiceStatus | '';
  invoiceSearch: string;
  invoicePage: number;
  setInvoiceStatus: (status: InvoiceStatus | '') => void;
  setInvoiceSearch: (query: string) => void;
  setInvoicePage: (page: number) => void;
  resetInvoiceFilters: () => void;

  // PO filters
  poStatus: POStatus | '';
  poSearch: string;
  poPage: number;
  setPOStatus: (status: POStatus | '') => void;
  setPOSearch: (query: string) => void;
  setPOPage: (page: number) => void;
  resetPOFilters: () => void;

  // Vendor filters
  vendorSearch: string;
  vendorVerified: boolean | null;
  vendorPage: number;
  setVendorSearch: (query: string) => void;
  setVendorVerified: (verified: boolean | null) => void;
  setVendorPage: (page: number) => void;
  resetVendorFilters: () => void;

  // Ticket filters
  ticketStatus: TicketStatus | '';
  ticketSearch: string;
  ticketPage: number;
  setTicketStatus: (status: TicketStatus | '') => void;
  setTicketSearch: (query: string) => void;
  setTicketPage: (page: number) => void;
  resetTicketFilters: () => void;

  // Payment filters
  paymentSearch: string;
  paymentPage: number;
  setPaymentSearch: (query: string) => void;
  setPaymentPage: (page: number) => void;
  resetPaymentFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // Invoice filters
      invoiceStatus: '',
      invoiceSearch: '',
      invoicePage: 1,
      setInvoiceStatus: (status) => set({ invoiceStatus: status }),
      setInvoiceSearch: (query) => set({ invoiceSearch: query, invoicePage: 1 }),
      setInvoicePage: (page) => set({ invoicePage: page }),
      resetInvoiceFilters: () =>
        set({ invoiceStatus: '', invoiceSearch: '', invoicePage: 1 }),

      // PO filters
      poStatus: '',
      poSearch: '',
      poPage: 1,
      setPOStatus: (status) => set({ poStatus: status }),
      setPOSearch: (query) => set({ poSearch: query, poPage: 1 }),
      setPOPage: (page) => set({ poPage: page }),
      resetPOFilters: () => set({ poStatus: '', poSearch: '', poPage: 1 }),

      // Vendor filters
      vendorSearch: '',
      vendorVerified: null,
      vendorPage: 1,
      setVendorSearch: (query) => set({ vendorSearch: query, vendorPage: 1 }),
      setVendorVerified: (verified) => set({ vendorVerified: verified }),
      setVendorPage: (page) => set({ vendorPage: page }),
      resetVendorFilters: () =>
        set({ vendorSearch: '', vendorVerified: null, vendorPage: 1 }),

      // Ticket filters
      ticketStatus: '',
      ticketSearch: '',
      ticketPage: 1,
      setTicketStatus: (status) => set({ ticketStatus: status }),
      setTicketSearch: (query) => set({ ticketSearch: query, ticketPage: 1 }),
      setTicketPage: (page) => set({ ticketPage: page }),
      resetTicketFilters: () =>
        set({ ticketStatus: '', ticketSearch: '', ticketPage: 1 }),

      // Payment filters
      paymentSearch: '',
      paymentPage: 1,
      setPaymentSearch: (query) => set({ paymentSearch: query, paymentPage: 1 }),
      setPaymentPage: (page) => set({ paymentPage: page }),
      resetPaymentFilters: () => set({ paymentSearch: '', paymentPage: 1 }),
    }),
    {
      name: 'filter-store',
    }
  )
);
