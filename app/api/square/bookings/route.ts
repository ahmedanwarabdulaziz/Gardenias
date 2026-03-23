import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      locationId,
      startAt,
      teamMemberId,
      serviceVariationId,
      serviceVariationVersion,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      customerNote,
    } = body;

    if (!locationId || !startAt || !teamMemberId || !serviceVariationId) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    // First, create or find the customer
    let customerId: string | undefined;

    if (customerEmail || customerPhone) {
      // Search for existing customer by email
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
        }
      }

      // Create customer if not found
      if (!customerId) {
        const createCustomerResponse = await client.customers.create({
          givenName: customerFirstName || undefined,
          familyName: customerLastName || undefined,
          emailAddress: customerEmail || undefined,
          phoneNumber: customerPhone || undefined,
        });

        customerId = createCustomerResponse.customer?.id;
      }
    }

    // Create the booking
    const bookingRequest: Record<string, unknown> = {
      booking: {
        locationId,
        startAt,
        customerId,
        customerNote: customerNote || undefined,
        appointmentSegments: [
          {
            teamMemberId,
            serviceVariationId,
            serviceVariationVersion: serviceVariationVersion 
              ? BigInt(serviceVariationVersion) 
              : undefined,
          },
        ],
      },
    };

    const bookingResponse = await client.bookings.create(
      bookingRequest as unknown as Parameters<typeof client.bookings.create>[0]
    );

    return NextResponse.json({
      booking: serializeSquareData(bookingResponse.booking) as Record<string, unknown>,
      success: true,
    });
  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
