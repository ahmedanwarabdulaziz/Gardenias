import { Box } from '@mui/material';
import ServicesHeroSection from '@/components/services/ServicesHeroSection';
import ServicesSection from '@/components/website/ServicesSection';
import { getServerData } from '@/lib/serverDataService';

export default async function ServicesPage() {
  // Fetch data server-side for instant loading
  const { categories, services } = await getServerData();

  return (
    <Box>
      {/* Hero Section */}
      <ServicesHeroSection
        title="Our Services"
        heroImage="/images/Oyeservices.png"
      />

      {/* Services Section - Same as Home Page */}
      <ServicesSection initialCategories={categories} initialServices={services} />
    </Box>
  );
}

