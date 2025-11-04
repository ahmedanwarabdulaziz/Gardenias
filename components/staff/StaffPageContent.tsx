'use client';

import { useState, useEffect } from 'react';
import StaffSectionInteractive from '@/components/website/StaffSectionInteractive';
import { PublicStaffService, PublicStaffMember } from '@/lib/publicStaffService';

export default function StaffPageContent() {
  const [staff, setStaff] = useState<PublicStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffData = await PublicStaffService.getPublicStaff();
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return <StaffSectionInteractive initialStaff={staff} />;
}

