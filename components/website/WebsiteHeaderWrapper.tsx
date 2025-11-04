/**
 * Server-side wrapper for WebsiteHeader
 * Fetches navigation data on the server and passes to client component
 */

import { getServerNavigationData } from '@/lib/serverDataService';
import WebsiteHeader from './WebsiteHeader';

export default async function WebsiteHeaderWrapper() {
  // Fetch navigation data server-side for instant loading
  const { categories, services, staff } = await getServerNavigationData();

  return (
    <WebsiteHeader 
      initialCategories={categories}
      initialServices={services}
      initialStaff={staff}
    />
  );
}

