import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/lib/seo/utils';
import HomePageContent from '@/components/website/HomePageContent';
import { getServerCategories, getServerServices, getServerStaff } from '@/lib/serverDataService';

// Lazy load components for better performance
const HeroSection = dynamic(() => import('@/components/website/HeroSection'), {
  loading: () => <div style={{ height: '600px', backgroundColor: '#f5f5f5' }} />,
});

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60;

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
  // Fetch data on the server in parallel for optimal performance
  const [categories, services, staff] = await Promise.all([
    getServerCategories(),
    getServerServices(),
    getServerStaff(),
  ]);

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
        
        {/* Content with server-side fetched data */}
        <HomePageContent 
          initialCategories={categories}
          initialServices={services}
          initialStaff={staff}
        />
      </Box>
    </>
  );
}
