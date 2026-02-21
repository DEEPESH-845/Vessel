/**
 * Contact Service
 * Manages contact CRUD operations with ENS resolution
 * Requirements: FR-8.1, FR-8.3, FR-8.4
 */

import { ethers } from 'ethers';
import { Contact, ContactFilter } from '@/types/wallet.types';
import { ensResolverService } from './ens-resolver.service';
import { getSecureStorage } from '@/lib/secure-storage';

/**
 * Contact Service
 * Handles contact management with local storage and sync
 */
export class ContactService {
  private static instance: ContactService;
  
  private readonly STORAGE_KEY = 'vessel-contacts';
  private contacts: Map<string, Contact> = new Map();
  private initialized = false;

  private constructor() {}

  static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }

  /**
   * Initialize contacts from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storage = getSecureStorage();
      if (storage.hasPassword()) {
        const data = await storage.getItem(this.STORAGE_KEY);
        if (data) {
          const contacts = JSON.parse(data) as Contact[];
          contacts.forEach((contact) => {
            this.contacts.set(contact.id, {
              ...contact,
              addedAt: new Date(contact.addedAt),
              lastUsed: contact.lastUsed ? new Date(contact.lastUsed) : undefined,
            });
          });
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize contacts:', error);
    }
  }

  /**
   * Persist contacts to storage
   */
  private async persist(): Promise<void> {
    try {
      const storage = getSecureStorage();
      if (storage.hasPassword()) {
        const data = JSON.stringify(Array.from(this.contacts.values()));
        await storage.setItem(this.STORAGE_KEY, data);
      }
    } catch (error) {
      console.error('Failed to persist contacts:', error);
    }
  }

  /**
   * Generate a unique ID for a contact
   */
  private generateId(): string {
    return `contact-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Add a new contact
   */
  async addContact(contact: {
    address: string;
    name: string;
    avatar?: string;
    tags?: string[];
    notes?: string;
  }): Promise<Contact> {
    await this.initialize();

    // Validate address
    if (!ethers.isAddress(contact.address)) {
      throw new Error('Invalid Ethereum address');
    }

    const normalizedAddress = ethers.getAddress(contact.address);

    // Check for duplicate
    const existing = this.findByAddress(normalizedAddress);
    if (existing) {
      throw new Error('Contact with this address already exists');
    }

    // Resolve ENS name
    const ensName = await ensResolverService.lookupAddress(normalizedAddress);

    const newContact: Contact = {
      id: this.generateId(),
      address: normalizedAddress,
      name: contact.name,
      avatar: contact.avatar,
      ensName: ensName || undefined,
      tags: contact.tags || [],
      notes: contact.notes,
      addedAt: new Date(),
    };

    this.contacts.set(newContact.id, newContact);
    await this.persist();

    return newContact;
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    id: string,
    updates: Partial<Omit<Contact, 'id' | 'addedAt'>>
  ): Promise<Contact | null> {
    await this.initialize();

    const existing = this.contacts.get(id);
    if (!existing) {
      return null;
    }

    // If address is being updated, validate and normalize
    if (updates.address && ethers.isAddress(updates.address)) {
      updates.address = ethers.getAddress(updates.address);
      
      // Check for duplicate (different ID but same address)
      const duplicate = this.findByAddress(updates.address);
      if (duplicate && duplicate.id !== id) {
        throw new Error('Another contact with this address already exists');
      }
    }

    const updated: Contact = {
      ...existing,
      ...updates,
    };

    this.contacts.set(id, updated);
    await this.persist();

    return updated;
  }

  /**
   * Delete a contact
   */
  async deleteContact(id: string): Promise<boolean> {
    await this.initialize();

    const existed = this.contacts.delete(id);
    if (existed) {
      await this.persist();
    }
    return existed;
  }

  /**
   * Get a contact by ID
   */
  async getContact(id: string): Promise<Contact | null> {
    await this.initialize();
    return this.contacts.get(id) || null;
  }

  /**
   * Find a contact by address
   */
  findByAddress(address: string): Contact | null {
    const normalized = ethers.getAddress(address);
    for (const contact of this.contacts.values()) {
      if (contact.address.toLowerCase() === normalized.toLowerCase()) {
        return contact;
      }
    }
    return null;
  }

  /**
   * Get all contacts
   */
  async getAllContacts(filter?: ContactFilter): Promise<Contact[]> {
    await this.initialize();

    let contacts = Array.from(this.contacts.values());

    // Apply tag filter
    if (filter?.tags && filter.tags.length > 0) {
      contacts = contacts.filter((c) =>
        c.tags?.some((tag) => filter.tags!.includes(tag))
      );
    }

    // Apply sorting
    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'name':
          contacts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'lastUsed':
          contacts.sort((a, b) => {
            const aTime = a.lastUsed?.getTime() || 0;
            const bTime = b.lastUsed?.getTime() || 0;
            return bTime - aTime; // Most recent first
          });
          break;
        case 'addedAt':
          contacts.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
          break;
      }
    }

    // Apply limit
    if (filter?.limit && filter.limit > 0) {
      contacts = contacts.slice(0, filter.limit);
    }

    return contacts;
  }

  /**
   * Update contact usage (called after transaction)
   */
  async updateContactUsage(address: string): Promise<void> {
    await this.initialize();

    const contact = this.findByAddress(address);
    if (contact) {
      contact.lastUsed = new Date();
      this.contacts.set(contact.id, contact);
      await this.persist();
    }
  }

  /**
   * Search contacts by name, ENS name, or address
   */
  async searchContacts(query: string): Promise<Contact[]> {
    await this.initialize();

    const normalizedQuery = query.toLowerCase().trim();
    
    return Array.from(this.contacts.values()).filter((contact) => {
      return (
        contact.name.toLowerCase().includes(normalizedQuery) ||
        contact.address.toLowerCase().includes(normalizedQuery) ||
        contact.ensName?.toLowerCase().includes(normalizedQuery) ||
        contact.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  }

  /**
   * Get frequently used contacts
   */
  async getFrequentContacts(limit: number = 5): Promise<Contact[]> {
    return this.getAllContacts({
      sortBy: 'lastUsed',
      limit,
    });
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    await this.initialize();

    const tags = new Set<string>();
    for (const contact of this.contacts.values()) {
      contact.tags?.forEach((tag) => tags.add(tag));
    }
    return Array.from(tags).sort();
  }

  /**
   * Sync contacts with external source (e.g., backend)
   */
  async syncWithBackend(apiUrl: string): Promise<void> {
    try {
      // Fetch contacts from backend
      const response = await fetch(`${apiUrl}/contacts`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Merge with local contacts
        for (const remoteContact of data.data) {
          const local = this.findByAddress(remoteContact.address);
          if (!local) {
            // Add new contact from backend
            this.contacts.set(remoteContact.id, {
              ...remoteContact,
              addedAt: new Date(remoteContact.addedAt),
              lastUsed: remoteContact.lastUsed ? new Date(remoteContact.lastUsed) : undefined,
            });
          } else {
            // Update local if remote is newer
            const remoteUpdated = new Date(remoteContact.updatedAt || 0);
            const localUpdated = (local as any).updatedAt 
              ? new Date((local as any).updatedAt) 
              : local.addedAt;
            
            if (remoteUpdated > localUpdated) {
              this.contacts.set(local.id, {
                ...local,
                ...remoteContact,
                addedAt: new Date(remoteContact.addedAt),
                lastUsed: remoteContact.lastUsed ? new Date(remoteContact.lastUsed) : undefined,
              });
            }
          }
        }
        await this.persist();
      }
    } catch (error) {
      console.error('Failed to sync contacts with backend:', error);
    }
  }

  /**
   * Clear all contacts
   */
  async clearAll(): Promise<void> {
    this.contacts.clear();
    await this.persist();
  }

  /**
   * Export contacts to JSON
   */
  async exportContacts(): Promise<string> {
    await this.initialize();
    return JSON.stringify(Array.from(this.contacts.values()), null, 2);
  }

  /**
   * Import contacts from JSON
   */
  async importContacts(jsonData: string): Promise<number> {
    try {
      const contacts = JSON.parse(jsonData) as Contact[];
      let imported = 0;

      for (const contact of contacts) {
        if (ethers.isAddress(contact.address)) {
          const existing = this.findByAddress(contact.address);
          if (!existing) {
            const newContact: Contact = {
              ...contact,
              id: this.generateId(),
              address: ethers.getAddress(contact.address),
              addedAt: new Date(contact.addedAt),
              lastUsed: contact.lastUsed ? new Date(contact.lastUsed) : undefined,
            };
            this.contacts.set(newContact.id, newContact);
            imported++;
          }
        }
      }

      await this.persist();
      return imported;
    } catch (error) {
      console.error('Failed to import contacts:', error);
      throw new Error('Invalid contact data format');
    }
  }
}

// Export singleton instance
export const contactService = ContactService.getInstance();