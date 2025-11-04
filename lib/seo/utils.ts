import type { Metadata } from 'next';
import { SITE_CONFIG } from './config';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Generate complete metadata for Next.js pages
 */
export function generateMetadata(data: SEOData = {}): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
    nofollow = false,
  } = data;

  const fullTitle = title 
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.defaultTitle;

  const metaDescription = description || SITE_CONFIG.defaultDescription;
  const metaKeywords = keywords?.join(', ') || SITE_CONFIG.defaultKeywords.join(', ');
  const metaImage = image || SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logoo.png`;
  const canonicalUrl = url || SITE_CONFIG.baseUrl;

  const robots = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: author ? [{ name: author }] : undefined,
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: SITE_CONFIG.language,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      title: fullTitle,
      description: metaDescription,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.defaultTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [metaImage],
      creator: SITE_CONFIG.social.twitter || undefined,
      site: SITE_CONFIG.social.twitter || undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    metadataBase: new URL(SITE_CONFIG.baseUrl),
    verification: {
      // Add verification codes here when available
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
    other: {
      'robots': robots,
    },
  };
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: SITE_CONFIG.organization.name,
    legalName: SITE_CONFIG.organization.legalName,
    url: SITE_CONFIG.organization.url,
    logo: SITE_CONFIG.organization.logo,
    image: SITE_CONFIG.organization.logo,
    description: SITE_CONFIG.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.location.streetAddress,
      addressLocality: SITE_CONFIG.location.addressLocality,
      addressRegion: SITE_CONFIG.location.addressRegion,
      postalCode: SITE_CONFIG.location.postalCode,
      addressCountry: SITE_CONFIG.location.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.contact.phone,
      contactType: 'customer service',
      email: SITE_CONFIG.contact.email,
      areaServed: SITE_CONFIG.region,
      availableLanguage: SITE_CONFIG.language,
    },
    areaServed: {
      '@type': 'City',
      name: SITE_CONFIG.location.addressLocality,
    },
    openingHoursSpecification: SITE_CONFIG.businessHours,
    sameAs: Object.values(SITE_CONFIG.social).filter(Boolean),
  };
}

/**
 * Generate JSON-LD structured data for Service
 */
export function generateServiceSchema(data: {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
  offers?: Array<{ price: number; currency: string; duration: string }>;
}) {
  const { name, description, url, image, category, offers } = data;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'MedicalBusiness',
      name: SITE_CONFIG.organization.name,
      url: SITE_CONFIG.organization.url,
    },
    url,
    image: image || SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logoo.png`,
    ...(category && {
      category: {
        '@type': 'Thing',
        name: category,
      },
    }),
    ...(offers && offers.length > 0 && {
      offers: offers.map((offer) => ({
        '@type': 'Offer',
        price: offer.price.toString(),
        priceCurrency: offer.currency,
        availability: 'https://schema.org/InStock',
        description: `${offer.duration} minutes`,
      })),
    }),
    areaServed: {
      '@type': 'City',
      name: SITE_CONFIG.location.addressLocality,
    },
  };
}

/**
 * Generate JSON-LD structured data for Person (Staff)
 */
export function generatePersonSchema(data: {
  name: string;
  jobTitle: string;
  description?: string;
  url: string;
  image?: string;
  credentials?: string;
  email?: string;
  telephone?: string;
}) {
  const { name, jobTitle, description, url, image, credentials, email, telephone } = data;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    ...(description && { description }),
    url,
    ...(image && { image }),
    worksFor: {
      '@type': 'MedicalBusiness',
      name: SITE_CONFIG.organization.name,
      url: SITE_CONFIG.organization.url,
    },
    ...(credentials && {
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: credentials,
      },
    }),
    ...(email && {
      email,
    }),
    ...(telephone && {
      telephone,
    }),
  };
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(data: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
}) {
  const { headline, description, url, image, publishedTime, modifiedTime, author } = data;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    image: image || SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logoo.png`,
    datePublished: publishedTime,
    ...(modifiedTime && { dateModified: modifiedTime }),
    author: {
      '@type': author ? 'Person' : 'Organization',
      name: author || SITE_CONFIG.organization.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.organization.logo,
      },
    },
  };
}


