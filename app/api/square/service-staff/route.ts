import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';

/**
 * GET /api/square/service-staff?itemId=CATALOG_ITEM_ID
 * 
 * Returns the team members assigned to each variation of a Square catalog item.
 * In Square, staff members are assigned per-variation (duration).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId query parameter is required' },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    // Step 1: Fetch the catalog item using catalog.search to find it by ID
    // We search for it among ITEM types and filter by ID
    let catalogItem: Record<string, unknown> | null = null;

    const searchResponse = await client.catalog.search({
      objectTypes: ['ITEM'],
      limit: 100,
    });

    if (searchResponse.objects) {
      for (const obj of searchResponse.objects) {
        if (obj.id === itemId) {
          catalogItem = serializeSquareData(obj);
          break;
        }
      }
    }

    if (!catalogItem) {
      return NextResponse.json(
        { error: 'Catalog item not found', itemId },
        { status: 404 }
      );
    }

    const itemData = catalogItem.itemData as Record<string, unknown> | undefined;
    const variations = (itemData?.variations as Array<Record<string, unknown>>) || [];

    // Step 2: Extract team member IDs from each variation
    const variationStaff: Record<string, string[]> = {};
    const allTeamMemberIds = new Set<string>();

    for (const variation of variations) {
      const vData = variation.itemVariationData as Record<string, unknown> | undefined;
      const teamMemberIds = (vData?.teamMemberIds as string[]) || [];
      const vId = variation.id as string;
      
      variationStaff[vId] = teamMemberIds;
      teamMemberIds.forEach(id => allTeamMemberIds.add(id));
    }

    // Step 3: Fetch team member details
    // First try getting all active team members from the team API
    let allMembers: Array<Record<string, unknown>> = [];
    try {
      const teamResponse = await client.teamMembers.search({
        query: { filter: { status: 'ACTIVE' } },
      });
      allMembers = serializeSquareData(teamResponse.teamMembers || []);
    } catch (e) {
      console.error('Error fetching team members:', e);
    }

    // Build a map of team member ID -> details
    const memberMap = new Map<string, Record<string, unknown>>();
    for (const member of allMembers) {
      memberMap.set(member.id as string, member);
    }

    // If no specific team member IDs found in variations,
    // fall back to listing bookable team members
    if (allTeamMemberIds.size === 0) {
      try {
        const profilesResponse = await client.bookings.teamMemberProfiles.list({});
        const profiles = serializeSquareData(profilesResponse.teamMemberBookingProfiles || []);
        
        for (const profile of (profiles as Array<Record<string, unknown>>)) {
          if (profile.isBookable) {
            const memberId = profile.teamMemberId as string;
            allTeamMemberIds.add(memberId);
          }
        }
      } catch (e) {
        console.error('Error fetching booking profiles:', e);
      }
    }

    // Format staff details
    const formatMember = (memberId: string) => {
      const member = memberMap.get(memberId);
      if (!member) {
        return { id: memberId, displayName: memberId, jobTitle: '' };
      }

      const wageSetting = member.wageSetting as Record<string, unknown> | undefined;
      const jobAssignments = (wageSetting?.jobAssignments as Array<Record<string, unknown>>) || [];
      const jobTitle = (jobAssignments[0]?.jobTitle as string) || '';

      return {
        id: memberId,
        displayName: `${member.givenName || ''} ${member.familyName || ''}`.trim(),
        jobTitle,
        profileImageUrl: (member.profileImageUrl as string) || null,
      };
    };

    // Build per-variation staff info
    const variationsWithStaff = variations.map((variation) => {
      const vData = variation.itemVariationData as Record<string, unknown> | undefined;
      const vPrice = vData?.priceMoney as Record<string, unknown> | undefined;
      const teamIds = variationStaff[variation.id as string] || [];

      return {
        variationId: variation.id as string,
        variationName: (vData?.name as string) || 'Standard',
        durationMinutes: vData?.serviceDuration ? Number(vData.serviceDuration) / 60000 : null,
        priceCents: vPrice?.amount ? Number(vPrice.amount) : null,
        currency: (vPrice?.currency as string) || 'CAD',
        teamMemberIds: teamIds,
        teamMembers: teamIds.length > 0
          ? teamIds.map(id => formatMember(id))
          : Array.from(allTeamMemberIds).map(id => formatMember(id)),
      };
    });

    // Unique staff across all variations
    const uniqueStaffIds = new Set<string>();
    variationsWithStaff.forEach(v => v.teamMembers.forEach(m => uniqueStaffIds.add(m.id)));

    return NextResponse.json({
      itemId,
      itemName: (itemData?.name as string) || '',
      staff: Array.from(uniqueStaffIds).map(id => formatMember(id)),
      variations: variationsWithStaff,
    });
  } catch (error) {
    console.error('Error fetching service staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service staff' },
      { status: 500 }
    );
  }
}
