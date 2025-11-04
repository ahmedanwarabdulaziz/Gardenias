import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/lib/seo/utils';
import StaffSectionWrapper from '@/components/website/StaffSectionWrapper';
import { getServerData, ServerCategory, ServerService } from '@/lib/serverDataService';

// Lazy load components for better performance
const HeroSection = dynamic(() => import('@/components/website/HeroSection'), {
  loading: () => <div style={{ height: '600px', backgroundColor: '#f5f5f5' }} />,
});

// Import ServicesSection directly since we're passing server-fetched data
// The component itself is still a client component ('use client')
import ServicesSection from '@/components/website/ServicesSection';

// Generate metadata for SEO
export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'Home - Professional Healthcare Services in Milton, ON',
    description: 'Gardenias Healthcare offers professional medical services including massage therapy, reflexology, naturopathic medicine, and more. Expert practitioners in Milton, Ontario.',
    keywords: ['healthcare Milton', 'massage therapy Milton', 'reflexology Milton', 'naturopathic medicine', 'healthcare clinic Milton Ontario'],
    url: 'https://www.gardenias-healthcare.net/',
  });
}

export default async function HomePage() {
  // Fetch data server-side for instant loading
  const { categories, services } = await getServerData();
  
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.gardenias-healthcare.net/' },
  ]);

  return (
    <>
      {/* Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <Box>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Services Section - Pass pre-fetched data as props */}
        <ServicesSection initialCategories={categories} initialServices={services} />
        
        {/* Staff Section */}
        <StaffSectionWrapper />
        
        {/* Other sections will be added here */}
      </Box>
    </>
  );
}
