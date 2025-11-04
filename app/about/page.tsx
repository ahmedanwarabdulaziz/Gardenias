import Script from 'next/script';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import { generateBreadcrumbSchema } from '@/lib/seo/utils';
import { SITE_CONFIG } from '@/lib/seo/config';
import AboutPageContent from '@/components/about/AboutPageContent';

export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'About Us - Gardenias Healthcare Clinic',
    description: 'Learn about Gardenias Healthcare Clinic in Milton, Ontario. Our mission is to help you achieve lasting wellness through personalized care, evidence-based therapies, and genuine human connection.',
    keywords: ['about Gardenias Healthcare', 'healthcare clinic Milton', 'Milton healthcare', 'medical clinic Milton Ontario'],
    url: 'https://www.gardenias-healthcare.net/about',
  });
}

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_CONFIG.baseUrl}/` },
    { name: 'About Us', url: `${SITE_CONFIG.baseUrl}/about` },
  ]);

  return (
    <>
      {/* Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <AboutPageContent />
    </>
  );
}
