import { NextResponse } from 'next/server';

const FIRESTORE_PROJECT_ID = 'gardenias-522c7';

/**
 * GET /api/booking/staff
 * Fetches all active staff from Firebase Firestore using the public REST API.
 * Used by the booking flow to display staff with their real name, title, and picture.
 */
export async function GET() {
  try {
    // Use Firestore REST API — bypasses client-side auth requirement
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/staff?pageSize=50`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Firestore REST error: ${res.status}`);
    }

    const data = await res.json();
    const documents = data.documents || [];

    interface FirestoreField {
      stringValue?: string;
      booleanValue?: boolean;
      integerValue?: string;
    }
    interface FirestoreDoc {
      name: string;
      fields: Record<string, FirestoreField>;
    }

    const staff = documents
      .map((doc: FirestoreDoc) => {
        const fields = doc.fields || {};
        const id = doc.name.split('/').pop();
        return {
          id,
          name: fields.name?.stringValue || '',
          title: fields.title?.stringValue || '',
          picture: fields.picture?.stringValue || null,
          shortDescription: fields.shortDescription?.stringValue || '',
          squareTeamMemberId: fields.squareTeamMemberId?.stringValue || null,
          isActive: fields.isActive?.booleanValue ?? true,
          order: parseInt(fields.order?.integerValue || '99', 10),
        };
      })
      .filter((s: { isActive: boolean; name: string }) => s.isActive && s.name)
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order);

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Failed to fetch staff from Firestore REST API:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}
