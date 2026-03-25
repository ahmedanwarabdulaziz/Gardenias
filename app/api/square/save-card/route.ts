import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceId,
      verificationToken,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
    } = body;

    console.log('[save-card] Received sourceId:', sourceId ? `${sourceId.substring(0, 20)}...` : 'MISSING');

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Missing card token (sourceId)' },
        { status: 400 }
      );
    }

    if (!customerEmail && !customerPhone) {
      return NextResponse.json(
        { error: 'Customer email or phone is required' },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    // ── 1. Create or find the customer ──────────────────────────────
    let customerId: string | undefined;

    if (customerEmail) {
      const searchResponse = await client.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: customerEmail,
            },
          },
        },
      });

      if (searchResponse.customers && searchResponse.customers.length > 0) {
        customerId = searchResponse.customers[0].id;
        console.log('[save-card] Found existing customer:', customerId);
      }
    }

    if (!customerId) {
      const createCustomerResponse = await client.customers.create({
        givenName: customerFirstName || undefined,
        familyName: customerLastName || undefined,
        emailAddress: customerEmail || undefined,
        phoneNumber: customerPhone || undefined,
        idempotencyKey: randomUUID(),
      });
      customerId = createCustomerResponse.customer?.id;
      console.log('[save-card] Created new customer:', customerId);
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Failed to create or find customer' },
        { status: 500 }
      );
    }

    // ── 2. Save card on file using the Cards API ────────────────────
    console.log('[save-card] Calling cards.create with sourceId and customerId:', customerId);
    const cardResponse = await client.cards.create({
      sourceId,
      verificationToken: verificationToken || undefined,
      card: {
        customerId,
      },
      idempotencyKey: randomUUID(),
    });

    const card = cardResponse.card;
    console.log('[save-card] Card saved successfully:', card?.id);

    return NextResponse.json({
      success: true,
      customerId,
      cardId: card?.id,
      card: serializeSquareData(card) as Record<string, unknown>,
    });
  } catch (error: unknown) {
    const errObj = error as Record<string, unknown>;
    console.error('[save-card] Error:', {
      message: errObj?.message,
      statusCode: errObj?.statusCode,
      body: errObj?.body,
      errors: errObj?.errors,
    });

    // Extract Square API error details for the frontend
    let errorMessage = 'Failed to save card';
    if (errObj?.body && typeof errObj.body === 'object') {
      const body = errObj.body as { errors?: Array<{ detail?: string }> };
      errorMessage = body.errors?.map(e => e.detail).join(', ') || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

