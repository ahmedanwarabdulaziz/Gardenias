/**
 * SEO Configuration - Centralized SEO settings
 * Domain: https://www.gardenias-healthcare.net
 */

export const SITE_CONFIG = {
  name: 'Gardenias Healthcare',
  shortName: 'Gardenias',
  domain: 'https://www.gardenias-healthcare.net',
  baseUrl: 'https://www.gardenias-healthcare.net',
  defaultTitle: 'Gardenias Healthcare - Professional Medical Services',
  defaultDescription: 'Professional healthcare services with modern medical facilities. Expert doctors, advanced treatments, and compassionate care for all your medical needs.',
  defaultKeywords: ['healthcare', 'medical', 'doctor', 'hospital', 'clinic', 'medical treatment', 'healthcare provider', 'medical consultation', 'Milton', 'Ontario'],
  language: 'en-CA',
  region: 'CA-ON',
  location: {
    streetAddress: '348 Bronte St South Unit #12',
    addressLocality: 'Milton',
    addressRegion: 'ON',
    postalCode: 'L9T 5B6',
    addressCountry: 'CA',
  },
  contact: {
    phone: '+1(647) 328-65-63',
    email: 'Info@gardenias-healthcare.net',
  },
  social: {
    // Will be populated from socialMediaService
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  },
  organization: {
    name: 'Gardenias Healthcare Clinic Inc.',
    legalName: 'Gardenias Healthcare Clinic Inc.',
    url: 'https://www.gardenias-healthcare.net',
    logo: 'https://www.gardenias-healthcare.net/images/logoo.png',
    foundingDate: '2022',
    type: 'MedicalBusiness',
  },
  defaultImage: 'https://www.gardenias-healthcare.net/images/logoo.png',
  businessHours: {
    // Can be updated via admin
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    opens: '09:00',
    closes: '18:00',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;


