/**
 * Contacts API Routes
 * GET: List all contacts
 * POST: Create a new contact
 * Requirements: FR-8.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/services/contact.service';
import { ContactFilter } from '@/types/wallet.types';

/**
 * GET /api/contacts
 * List all contacts with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filter: ContactFilter = {
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      sortBy: searchParams.get('sortBy') as ContactFilter['sortBy'] || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    const contacts = await contactService.getAllContacts(filter);

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { address, name, avatar, tags, notes } = body as {
      address: string;
      name: string;
      avatar?: string;
      tags?: string[];
      notes?: string;
    };

    if (!address || !name) {
      return NextResponse.json(
        { success: false, error: 'address and name are required' },
        { status: 400 }
      );
    }

    const contact = await contactService.addContact({
      address,
      name,
      avatar,
      tags,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create contact';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}