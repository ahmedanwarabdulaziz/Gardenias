import { Box } from '@mui/material';
import ServicesHeroSection from '@/components/services/ServicesHeroSection';
import StaffSectionInteractive from '@/components/website/StaffSectionInteractive';
import { getServerStaff } from '@/lib/serverDataService';

export default async function StaffPage() {
  // Fetch staff data server-side for instant loading
  const staff = await getServerStaff();

  return (
    <Box>
      {/* Hero Section */}
      <ServicesHeroSection
        title="Our Staff"
        heroImage="/images/staaaf.png"
      />

      {/* Staff Section - Same as Home Page */}
      <StaffSectionInteractive initialStaff={staff} />
    </Box>
  );
}
