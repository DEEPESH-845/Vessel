/**
 * Contacts Slice
 * Manages contact list, contact operations, and usage tracking
 */

import { StateCreator } from 'zustand';
import { Contact } from '@/types/wallet.types';

export interface ContactsSlice {
  // State
  contacts: Contact[];
  isLoading: boolean;
  lastSyncedAt: Date | null;

  // Actions
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  updateContactUsage: (address: string) => void;
  setLoading: (loading: boolean) => void;
  setLastSyncedAt: (date: Date) => void;
}

export const createContactsSlice: StateCreator<ContactsSlice> = (set) => ({
  // Initial state
  contacts: [],
  isLoading: false,
  lastSyncedAt: null,

  // Actions
  setContacts: (contacts) =>
    set({
      contacts,
      lastSyncedAt: new Date(),
    }),

  addContact: (contact) =>
    set((state) => ({
      contacts: [...state.contacts, contact],
    })),

  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === id ? { ...contact, ...updates } : contact
      ),
    })),

  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== id),
    })),

  updateContactUsage: (address) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.address.toLowerCase() === address.toLowerCase()
          ? { ...contact, lastUsed: new Date() }
          : contact
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setLastSyncedAt: (date) => set({ lastSyncedAt: date }),
});
