import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceVariationId, teamMemberId, locationId, startDate, endDate } = body;

    if (!serviceVariationId || !locationId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceVariationId, locationId, startDate, endDate' },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    // Build the segment filter
    interface SegmentFilter {
      serviceVariationId: string;
      teamMemberIdFilter?: { any: string[] };
    }
    const segmentFilter: SegmentFilter = {
      serviceVariationId,
    };
    if (teamMemberId) {
      segmentFilter.teamMemberIdFilter = {
        any: [teamMemberId],
      };
    }

    const response = await client.bookings.searchAvailability({
      query: {
        filter: {
          startAtRange: {
            startAt: startDate,
            endAt: endDate,
          },
          locationId,
          segmentFilters: [segmentFilter],
        },
      },
    });

    const availabilities = serializeSquareData(response.availabilities || []) as unknown[];

    return NextResponse.json({ availabilities });
  } catch (error: unknown) {
    // Log full details to help debug Square API issues
    const errObj = error as Record<string, unknown>;
    console.error('Error searching availability:', {
      message: errObj?.message || error,
      statusCode: errObj?.statusCode,
      body: errObj?.body,
      errors: errObj?.errors,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to search availability';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
