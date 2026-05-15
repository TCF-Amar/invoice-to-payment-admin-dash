import { create } from 'zustand';
import { CreatePOPayload, POLineItem } from '@/types';

interface POStore {
  draftPO: Partial<CreatePOPayload>;
  currentStep: number;
  setDraftPO: (partial: Partial<CreatePOPayload>) => void;
  updateDraftPO: (partial: Partial<CreatePOPayload>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  resetDraft: () => void;
  addLineItem: (item: POLineItem) => void;
  removeLineItem: (index: number) => void;
  updateLineItem: (index: number, item: POLineItem) => void;
}

const initialDraft: Partial<CreatePOPayload> = {
  poNumber: '',
  approvedAmount: 0,
  currency: 'USD',
  lineItems: [],
  status: 'draft',
};

export const usePOStore = create<POStore>((set) => ({
  draftPO: initialDraft,
  currentStep: 0,
  setDraftPO: (partial) => set({ draftPO: partial }),
  updateDraftPO: (partial) =>
    set((state) => ({
      draftPO: { ...state.draftPO, ...partial },
    })),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  setStep: (step) => set({ currentStep: Math.max(0, Math.min(step, 3)) }),
  resetDraft: () => set({ draftPO: initialDraft, currentStep: 0 }),
  addLineItem: () =>
    set((state) => ({
      draftPO: {
        ...state.draftPO,
        lineItems: [
          ...(state.draftPO.lineItems || []),
          { description: '', qty: 1, unitPrice: 0, total: 0 },
        ],
      },
    })),
  removeLineItem: (index) =>
    set((state) => ({
      draftPO: {
        ...state.draftPO,
        lineItems: (state.draftPO.lineItems || []).filter((_, i) => i !== index),
      },
    })),
  updateLineItem: (index, item) =>
    set((state) => ({
      draftPO: {
        ...state.draftPO,
        lineItems: (state.draftPO.lineItems || []).map((li, i) => (i === index ? item : li)),
      },
    })),
}));
