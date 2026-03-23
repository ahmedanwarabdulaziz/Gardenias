import { NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();

    // First try to get team member booking profiles
    let bookingProfiles: Array<Record<string, unknown>> = [];
    try {
      const profilesResponse = await client.bookings.teamMemberProfiles.list({});
      bookingProfiles = serializeSquareData(profilesResponse.data || []) as unknown as Array<Record<string, unknown>>;
    } catch {
      // Booking profiles may not be available, fall back to team members
    }

    // Get all active team members
    const searchResponse = await client.teamMembers.search({
      query: {
        filter: {
          status: 'ACTIVE',
        },
      },
    });
    const teamMembers = serializeSquareData(searchResponse.teamMembers || []) as unknown as Array<Record<string, unknown>>;

    // If we have booking profiles, use them to determine bookability
    // Otherwise, use all team members
    if (bookingProfiles.length > 0) {
      const staff = bookingProfiles.map(profile => {
        const member = teamMembers.find(
          (m: Record<string, unknown>) => m.id === profile.teamMemberId
        ) as Record<string, unknown> | undefined;

        return {
          id: profile.teamMemberId,
          displayName: (profile.displayName as string) || 
            (member ? `${member.givenName || ''} ${member.familyName || ''}`.trim() : 'Staff Member'),
          description: (profile.description as string) || '',
          profileImageUrl: (profile.profileImageUrl as string) || null,
          isBookable: profile.isBookable ?? true,
          jobTitle: member?.wageSetting 
            ? ((member.wageSetting as Record<string, unknown>).jobAssignments as Array<Record<string, unknown>>)?.[0]?.jobTitle || ''
            : '',
        };
      }).filter(s => s.isBookable);

      return NextResponse.json({ staff });
    }

    // Fallback: use all active team members — admin will manually link them
    const staff = teamMembers
      .map((member: Record<string, unknown>) => {
        const wageSetting = member.wageSetting as Record<string, unknown> | undefined;
        const jobAssignments = (wageSetting?.jobAssignments as Array<Record<string, unknown>>) || [];
        const jobTitle = (jobAssignments[0]?.jobTitle as string) || '';

        return {
          id: member.id as string,
          displayName: `${member.givenName || ''} ${member.familyName || ''}`.trim(),
          description: jobTitle,
          profileImageUrl: null,
          isBookable: true,
          jobTitle,
        };
      })
      .filter((s: { displayName: string }) => s.displayName.length > 0);

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error fetching Square team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
