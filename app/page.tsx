import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/lib/seo/utils';

// Lazy load components for better performance
const HeroSection = dynamic(() => import('@/components/website/HeroSection'), {
  loading: () => <div style={{ height: '600px', backgroundColor: '#f5f5f5' }} />,
});

const ServicesSection = dynamic(() => import('@/components/website/ServicesSection'), {
  loading: () => <div style={{ height: '400px', backgroundColor: '#f8faf9' }} />,
});

const StaffSection = dynamic(() => import('@/components/website/StaffSectionInteractive'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', backgroundColor: '#f8faf9' }} />,
});

// Generate metadata for SEO
export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'Home - Professional Healthcare Services in Milton, ON',
    description: 'Gardenias Healthcare offers professional medical services including massage therapy, reflexology, naturopathic medicine, and more. Expert practitioners in Milton, Ontario.',
    keywords: ['healthcare Milton', 'massage therapy Milton', 'reflexology Milton', 'naturopathic medicine', 'healthcare clinic Milton Ontario'],
    url: 'https://www.gardenias-healthcare.net/',
  });
}

export default function HomePage() {
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
        
        {/* Services Section */}
        <ServicesSection />
        
        {/* Staff Section */}
        <StaffSection />
        
        {/* Other sections will be added here */}
      </Box>
    </>
  );
}
