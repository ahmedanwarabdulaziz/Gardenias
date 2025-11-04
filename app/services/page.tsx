import { Box } from '@mui/material';
import ServicesHeroSection from '@/components/services/ServicesHeroSection';
import ServicesPageContent from '@/components/services/ServicesPageContent';

export default function ServicesPage() {
  return (
    <Box>
      {/* Hero Section */}
      <ServicesHeroSection
        title="Our Services"
        heroImage="/images/Oyeservices.png"
      />

      {/* Services Section with client-side fetching */}
      <ServicesPageContent />
    </Box>
  );
}

