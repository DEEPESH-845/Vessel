/**
 * Contact Management Components
 * ContactList, ContactCard, ContactFormDialog, ContactSelector
 * Requirements: FR-8.1, FR-8.2, FR-8.3, FR-8.4
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Clock,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ENSAvatar, ENSNameDisplay } from './ens-display';
import { Contact } from '@/types/wallet.types';

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Contact Card Component
 */
function ContactCard({ 
  contact,
  onEdit,
  onDelete,
  onSelect
}: { 
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onSelect?: (contact: Contact) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    setIsDeleting(true);
    await onDelete(contact.id);
    setIsDeleting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <ENSAvatar 
          address={contact.address}
          ensName={contact.ensName}
          avatarUrl={contact.avatar}
          size={48}
          onClick={() => onSelect?.(contact)}
          className="cursor-pointer"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="cursor-pointer" onClick={() => onSelect?.(contact)}>
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {contact.name}
              </h3>
              <ENSNameDisplay 
                address={contact.address}
                ensName={contact.ensName}
                showAddress={!contact.ensName}
                className="text-sm"
              />
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(contact)}
              >
                <Edit className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
          
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {contact.lastUsed && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              Last used: {formatDate(contact.lastUsed)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Contact Form Dialog
 */
function ContactFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { address: string; name: string; tags?: string[]; notes?: string }) => void;
  initialData?: Contact | null;
}) {
  const [address, setAddress] = useState(initialData?.address || '');
  const [name, setName] = useState(initialData?.name || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAddress(initialData?.address || '');
      setName(initialData?.name || '');
      setTags(initialData?.tags || []);
      setNotes(initialData?.notes || '');
      setTagInput('');
    }
  }, [isOpen, initialData]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!address || !name) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        address,
        name,
        tags: tags.length > 0 ? tags : undefined,
        notes: notes || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? 'Edit Contact' : 'Add Contact'}
        </h3>
        
        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... or ENS name"
              disabled={!!initialData}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outline" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!address || !name || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Save' : 'Add Contact')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Contact List Component
 */
export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch('/api/contacts?sortBy=lastUsed');
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCreateContact = async (data: { address: string; name: string; tags?: string[]; notes?: string }) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setContacts((prev) => [result.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
    }
  };

  const handleUpdateContact = async (data: { address: string; name: string; tags?: string[]; notes?: string }) => {
    if (!editingContact) return;
    
    try {
      const response = await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? result.data : c))
        );
        setEditingContact(null);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.address.toLowerCase().includes(query) ||
      contact.ensName?.toLowerCase().includes(query) ||
      contact.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Contacts
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => {
            setEditingContact(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </CardHeader>
      
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="pl-10"
          />
        </div>

        {/* Contact List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            {searchQuery ? (
              <p>No contacts found matching "{searchQuery}"</p>
            ) : (
              <>
                <p>No contacts yet</p>
                <p className="text-sm mt-1">Add your first contact to get started</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDeleteContact}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {isFormOpen && (
            <ContactFormDialog
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setEditingContact(null);
              }}
              onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
              initialData={editingContact}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/**
 * Contact Selector Component (for use in send flows)
 */
export function ContactSelector({ 
  onSelect,
  excludeAddresses = []
}: { 
  onSelect: (contact: Contact) => void;
  excludeAddresses?: string[];
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecentContacts = async () => {
      try {
        const response = await fetch('/api/contacts?sortBy=lastUsed&limit=10');
        const data = await response.json();
        if (data.success) {
          setContacts(
            data.data.filter(
              (c: Contact) => !excludeAddresses.includes(c.address.toLowerCase())
            )
          );
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentContacts();
  }, [excludeAddresses]);

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.address.toLowerCase().includes(query) ||
      contact.ensName?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No contacts yet. Add contacts to see them here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="pl-10"
        />
      </div>
      
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredContacts.map((contact) => (
          <motion.button
            key={contact.id}
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            className="w-full flex items-center gap-3 p-2 rounded-lg text-left"
            onClick={() => onSelect(contact)}
          >
            <ENSAvatar 
              address={contact.address}
              ensName={contact.ensName}
              avatarUrl={contact.avatar}
              size={32}
            />
            <div>
              <p className="font-medium text-sm">{contact.name}</p>
              {contact.ensName && (
                <p className="text-xs text-gray-500">{contact.ensName}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ContactList;