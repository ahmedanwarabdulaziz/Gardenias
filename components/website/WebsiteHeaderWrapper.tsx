'use client';

import WebsiteHeader from './WebsiteHeader';
import { ServerCategory, ServerService, ServerStaffMember } from '@/lib/serverDataService';

interface WebsiteHeaderWrapperProps {
  initialCategories: ServerCategory[];
  initialServices: ServerService[];
  initialStaff: ServerStaffMember[];
}

export default function WebsiteHeaderWrapper({
  initialCategories,
  initialServices,
  initialStaff,
}: WebsiteHeaderWrapperProps) {
  return (
    <WebsiteHeader 
      initialCategories={initialCategories}
      initialServices={initialServices}
      initialStaff={initialStaff}
    />
  );
}

