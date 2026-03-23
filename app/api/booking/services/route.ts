import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * GET /api/booking/services
 * 
 * Public endpoint — returns active Firebase services grouped by category,
 * with squareMapping data for booking. Only returns services that have
 * been linked to Square (have squareMapping).
 */
export async function GET() {
  try {
    // Fetch categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(query(categoriesRef, orderBy('displayOrder', 'asc')));
    const categories: Record<string, { id: string; name: string; displayOrder: number }> = {};
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      categories[doc.id] = {
        id: doc.id,
        name: data.name || '',
        displayOrder: data.displayOrder || 0,
      };
    });

    // Fetch active services
    const servicesRef = collection(db, 'services');
    const servicesSnapshot = await getDocs(
      query(servicesRef, where('isActive', '==', true), orderBy('displayOrder', 'asc'))
    );

    interface ServiceVariation {
      variationId: string;
      variationName: string;
      version: string;
      durationMinutes: number | null;
      priceCents: number | null;
      currency: string;
    }

    interface BookingService {
      id: string;
      name: string;
      slug: string;
      shortDescription: string;
      categoryId: string;
      categoryName: string;
      squareItemId: string;
      variations: ServiceVariation[];
      displayOrder: number;
    }

    const services: BookingService[] = [];

    servicesSnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include services linked to Square
      if (!data.squareMapping?.squareItemId) return;

      const category = categories[data.categoryId];
      
      services.push({
        id: doc.id,
        name: data.name || '',
        slug: data.slug || '',
        shortDescription: data.shortDescription || '',
        categoryId: data.categoryId || '',
        categoryName: category?.name || 'Other',
        squareItemId: data.squareMapping.squareItemId,
        variations: (data.squareMapping.variations || []).map((v: ServiceVariation) => ({
          variationId: v.variationId,
          variationName: v.variationName,
          version: v.version,
          durationMinutes: v.durationMinutes,
          priceCents: v.priceCents,
          currency: v.currency,
        })),
        displayOrder: data.displayOrder || 0,
      });
    });

    // Group by category
    const grouped: Record<string, { categoryName: string; categoryOrder: number; services: BookingService[] }> = {};

    for (const service of services) {
      const catId = service.categoryId || 'other';
      if (!grouped[catId]) {
        const cat = categories[catId];
        grouped[catId] = {
          categoryName: cat?.name || 'Other',
          categoryOrder: cat?.displayOrder || 999,
          services: [],
        };
      }
      grouped[catId].services.push(service);
    }

    // Sort categories by order
    const sortedCategories = Object.entries(grouped)
      .sort(([, a], [, b]) => a.categoryOrder - b.categoryOrder)
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.categoryName,
        services: data.services,
      }));

    return NextResponse.json({ categories: sortedCategories });
  } catch (error) {
    console.error('Error fetching booking services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
