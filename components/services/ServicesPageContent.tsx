'use client';

import { useState, useEffect } from 'react';
import ServicesSection from '@/components/website/ServicesSection';
import { PublicCategoryService, PublicCategory, PublicService } from '@/lib/publicCategoryService';

export default function ServicesPageContent() {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, servicesData] = await Promise.all([
          PublicCategoryService.getPublicCategories(),
          PublicCategoryService.getPublicServices(),
        ]);
        setCategories(categoriesData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return <ServicesSection initialCategories={categories} initialServices={services} />;
}

