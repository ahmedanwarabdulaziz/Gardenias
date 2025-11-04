import { Box } from '@mui/material';
import ServicesHeroSection from '@/components/services/ServicesHeroSection';
import StaffPageContent from '@/components/staff/StaffPageContent';

export default function StaffPage() {
  return (
    <Box>
      {/* Hero Section */}
      <ServicesHeroSection
        title="Our Staff"
        heroImage="/images/staaaf.png"
      />

      {/* Staff Section with client-side fetching */}
      <StaffPageContent />
    </Box>
  );
}
