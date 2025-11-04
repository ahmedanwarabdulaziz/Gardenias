import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/config';
import { PublicCategoryService } from '@/lib/publicCategoryService';
import { PublicStaffService } from '@/lib/publicStaffService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.baseUrl;
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/staff`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic service pages
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const services = await PublicCategoryService.getPublicServices();
    servicePages = services
      .filter(service => service.isActive && service.slug)
      .map(service => ({
        url: `${baseUrl}/services/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error('Error generating service sitemap entries:', error);
  }

  // Dynamic staff pages
  let staffPages: MetadataRoute.Sitemap = [];
  try {
    const staff = await PublicStaffService.getPublicStaff();
    staffPages = staff
      .filter(member => member.slug || member.id)
      .map(member => ({
        url: `${baseUrl}/staff/${member.slug || member.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error('Error generating staff sitemap entries:', error);
  }

  return [...staticPages, ...servicePages, ...staffPages];
}


