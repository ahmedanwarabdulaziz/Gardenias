'use client';

import dynamic from 'next/dynamic';

const StaffSectionInteractive = dynamic(
  () => import('@/components/website/StaffSectionInteractive'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', backgroundColor: '#f8faf9' }} />,
  }
);

export default function StaffSectionWrapper() {
  return <StaffSectionInteractive />;
}

