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
    const segmentFilter: any = {
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

    const availabilities = serializeSquareData(response.availabilities || []);

    return NextResponse.json({ availabilities });
  } catch (error) {
    console.error('Error searching availability:', error);
    return NextResponse.json(
      { error: 'Failed to search availability', details: error instanceof Error ? error.message : JSON.stringify(error) },
      { status: 500 }
    );
  }
}
