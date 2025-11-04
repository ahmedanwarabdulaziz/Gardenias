'use client';

import dynamic from 'next/dynamic';
import { ServerStaffMember } from '@/lib/serverDataService';

const StaffSectionInteractive = dynamic(
  () => import('@/components/website/StaffSectionInteractive'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', backgroundColor: '#f8faf9' }} />,
  }
);

interface StaffSectionWrapperProps {
  initialStaff: ServerStaffMember[];
}

export default function StaffSectionWrapper({ initialStaff }: StaffSectionWrapperProps) {
  return <StaffSectionInteractive initialStaff={initialStaff} />;
}

