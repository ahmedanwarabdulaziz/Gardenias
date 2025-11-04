'use client';

import ServicesSection from '@/components/website/ServicesSection';
import StaffSectionWrapper from '@/components/website/StaffSectionWrapper';
import { ServerCategory, ServerService, ServerStaffMember } from '@/lib/serverDataService';

interface HomePageContentProps {
  initialCategories: ServerCategory[];
  initialServices: ServerService[];
  initialStaff: ServerStaffMember[];
}

export default function HomePageContent({ 
  initialCategories, 
  initialServices, 
  initialStaff 
}: HomePageContentProps) {
  return (
    <>
      {/* Services Section */}
      <ServicesSection 
        initialCategories={initialCategories} 
        initialServices={initialServices} 
      />
      
      {/* Staff Section */}
      <StaffSectionWrapper initialStaff={initialStaff} />
    </>
  );
}

