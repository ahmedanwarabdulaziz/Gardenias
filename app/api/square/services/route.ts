import { NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';

export async function GET() {
  try {
    const client = getSquareClient();

    // Get the location(s)
    const locationsResponse = await client.locations.list();
    const locations = locationsResponse.locations || [];
    
    if (locations.length === 0) {
      return NextResponse.json({ services: [], locationId: null });
    }

    const locationId = locations[0].id!;

    // Use catalog.search (not catalog.list) to find appointment service items
    // catalog.list sometimes returns empty for appointment services
    const catalogItems: Array<Record<string, unknown>> = [];
    let cursor: string | undefined;

    do {
      const response = await client.catalog.search({
        objectTypes: ['ITEM'],
        cursor,
        limit: 100,
      });
      
      if (response.objects) {
        for (const obj of response.objects) {
          if (obj.itemData?.productType === 'APPOINTMENTS_SERVICE') {
            catalogItems.push(serializeSquareData(obj));
          }
        }
      }
      cursor = response.cursor ?? undefined;
    } while (cursor);

    // Transform catalog items into a simpler format for the frontend
    const services = catalogItems.map((item: Record<string, unknown>) => {
      const itemData = item.itemData as Record<string, unknown> | undefined;
      const variations = (itemData?.variations as Array<Record<string, unknown>>) || [];
      const firstVariation = variations[0] || {};
      const variationData = firstVariation.itemVariationData as Record<string, unknown> | undefined;
      const priceMoney = variationData?.priceMoney as Record<string, unknown> | undefined;

      return {
        id: item.id,
        name: itemData?.name || 'Unnamed Service',
        description: itemData?.descriptionPlaintext || itemData?.description || '',
        variations: variations.map((v: Record<string, unknown>) => {
          const vData = v.itemVariationData as Record<string, unknown> | undefined;
          const vPrice = vData?.priceMoney as Record<string, unknown> | undefined;
          return {
            id: v.id,
            name: vData?.name || 'Standard',
            durationMinutes: vData?.serviceDuration ? Number(vData.serviceDuration) / 60000 : null,
            priceCents: vPrice?.amount ? Number(vPrice.amount) : null,
            currency: vPrice?.currency || 'CAD',
            version: v.version,
          };
        }),
        // Provide defaults from first variation
        durationMinutes: variationData?.serviceDuration ? Number(variationData.serviceDuration) / 60000 : null,
        priceCents: priceMoney?.amount ? Number(priceMoney.amount) : null,
        currency: priceMoney?.currency || 'CAD',
      };
    });

    return NextResponse.json({ services, locationId });
  } catch (error) {
    console.error('Error fetching Square services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
