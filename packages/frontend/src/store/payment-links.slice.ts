/**
 * Payment Links Slice
 * Manages payment link creation, tracking, and payment processing
 */

import { StateCreator } from 'zustand';
import { PaymentLink, Payment } from '@/types/payment-link.types';

export interface PaymentLinksSlice {
  // State
  paymentLinks: PaymentLink[];
  activePaymentLink: PaymentLink | null;
  payments: Payment[];
  isLoading: boolean;

  // Actions
  setPaymentLinks: (links: PaymentLink[]) => void;
  addPaymentLink: (link: PaymentLink) => void;
  updatePaymentLink: (id: string, updates: Partial<PaymentLink>) => void;
  deletePaymentLink: (id: string) => void;
  setActivePaymentLink: (link: PaymentLink | null) => void;
  addPayment: (payment: Payment) => void;
  setPayments: (payments: Payment[]) => void;
  setLoading: (loading: boolean) => void;
}

export const createPaymentLinksSlice: StateCreator<PaymentLinksSlice> = (set) => ({
  // Initial state
  paymentLinks: [],
  activePaymentLink: null,
  payments: [],
  isLoading: false,

  // Actions
  setPaymentLinks: (links) => set({ paymentLinks: links }),

  addPaymentLink: (link) =>
    set((state) => ({
      paymentLinks: [...state.paymentLinks, link],
    })),

  updatePaymentLink: (id, updates) =>
    set((state) => ({
      paymentLinks: state.paymentLinks.map((link) =>
        link.id === id ? { ...link, ...updates } : link
      ),
    })),

  deletePaymentLink: (id) =>
    set((state) => ({
      paymentLinks: state.paymentLinks.filter((link) => link.id !== id),
    })),

  setActivePaymentLink: (link) => set({ activePaymentLink: link }),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, payment],
    })),

  setPayments: (payments) => set({ payments }),

  setLoading: (loading) => set({ isLoading: loading }),
});
