import { notFound } from 'next/navigation';
import { Box } from '@mui/material';
import Script from 'next/script';
import ServiceHeroSection from '@/components/services/ServiceHeroSection';
import ServiceAboutSection from '@/components/services/ServiceAboutSection';
import ServiceInfoCards from '@/components/services/ServiceInfoCards';
import ServiceContraindicationsSection from '@/components/services/ServiceContraindicationsSection';
import ServiceSessionExperience from '@/components/services/ServiceSessionExperience';
import ServiceBookingNotes from '@/components/services/ServiceBookingNotes';
import { PublicCategoryService } from '@/lib/publicCategoryService';
import { PublicStaffService } from '@/lib/publicStaffService';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/utils';
import { SITE_CONFIG } from '@/lib/seo/config';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = params;
  
  try {
    const service = await PublicCategoryService.getServiceBySlug(slug);
    
    if (!service) {
      return generateSEOMetadata();
    }

    const categories = await PublicCategoryService.getPublicCategories();
    const category = categories.find(cat => cat.id === service.categoryId);
    
    const title = service.seoTitle || `${service.name} | ${category?.name || 'Service'} | Gardenias Healthcare`;
    const description = service.seoDescription || service.shortDescription;
    const keywords = service.keywords || [service.name, category?.name || '', 'Milton', 'Ontario'];
    const url = `${SITE_CONFIG.baseUrl}/services/${slug}`;
    const image = service.heroImage || SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logo.png`;

    return generateSEOMetadata({
      title,
      description,
      keywords,
      url,
      image,
      type: 'website',
    });
  } catch (error) {
    return generateSEOMetadata();
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = params;
  
  // Fetch service data
  const service = await PublicCategoryService.getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Fetch category name
  const categories = await PublicCategoryService.getPublicCategories();
  const category = categories.find(cat => cat.id === service.categoryId);

  // Fetch staff data for practitioners assigned to this service
  const allStaff = await PublicStaffService.getPublicStaff();
  const practitioners = allStaff.filter(staff => 
    service.practitioners?.includes(staff.id)
  );

  const serviceUrl = `${SITE_CONFIG.baseUrl}/services/${slug}`;
  
  // Generate structured data
  const serviceSchema = generateServiceSchema({
    name: service.name,
    description: service.fullDescription || service.shortDescription,
    url: serviceUrl,
    image: service.heroImage,
    category: category?.name,
    offers: service.sessionDurations?.map(session => ({
      price: session.price,
      currency: 'CAD',
      duration: `${session.duration} minutes`,
    })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_CONFIG.baseUrl}/` },
    { name: 'Services', url: `${SITE_CONFIG.baseUrl}/services` },
    { name: category?.name || 'Services', url: category?.slug ? `${SITE_CONFIG.baseUrl}/services?category=${category.slug}` : `${SITE_CONFIG.baseUrl}/services` },
    { name: service.name, url: serviceUrl },
  ]);

  return (
    <>
      {/* Structured Data */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <Box>
        {/* Hero Section */}
        <ServiceHeroSection
          title={service.name}
          shortDescription={service.shortDescription}
          heroImage={service.heroImage}
          categoryName={category?.name}
          sessionDurations={service.sessionDurations}
          bookingLink={service.bookingLink}
        />
        
        {/* About Section */}
        <ServiceAboutSection
          serviceName={service.name}
          fullDescription={service.fullDescription}
        />
        
        {/* Session Experience Section */}
        <ServiceSessionExperience
          firstVisitOverview={service.firstVisitOverview || ''}
          whatToWear={service.whatToWear || []}
          aftercareAdvice={service.aftercareAdvice || []}
          image={service.galleryImages?.[0] || service.heroImage}
        />
        
        {/* Info Cards Section */}
        <ServiceInfoCards
          whoItsFor={service.whoItsFor || []}
          commonConditions={service.commonConditions || []}
          expectedBenefits={service.expectedBenefits || []}
        />
        
        {/* Contraindications Section */}
        <ServiceContraindicationsSection
          contraindications={service.contraindications || []}
          whenToSeeDoctor={service.whenToSeeDoctor}
        />
        
        {/* Booking Notes Section */}
        <ServiceBookingNotes
          preBookingNote={service.preBookingNote}
          postBookingInstructions={service.postBookingInstructions}
          practitioners={practitioners}
        />
        
        {/* Other sections will be added here step by step */}
      </Box>
    </>
  );
}

// Generate static params for all services (optional, for static generation)
export async function generateStaticParams() {
  const services = await PublicCategoryService.getPublicServices();
  
  return services.map((service) => ({
    slug: service.slug || service.id,
  }));
}

