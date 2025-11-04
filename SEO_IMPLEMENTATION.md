# SEO Implementation Guide

## Overview

This document describes the comprehensive SEO implementation for Gardenias Healthcare. All pages are now SEO-friendly with professional metadata, structured data, and easy-to-update configuration.

## What's Been Implemented

### 1. Centralized SEO Configuration
- **Location**: `lib/seo/config.ts`
- **Purpose**: Single source of truth for SEO settings
- **Contains**: Domain, default metadata, business information, contact details

### 2. SEO Utility Functions
- **Location**: `lib/seo/utils.ts`
- **Functions**:
  - `generateMetadata()` - Creates Next.js metadata with Open Graph, Twitter Cards, robots, etc.
  - `generateOrganizationSchema()` - JSON-LD for organization
  - `generateServiceSchema()` - JSON-LD for services
  - `generatePersonSchema()` - JSON-LD for staff members
  - `generateBreadcrumbSchema()` - Breadcrumb navigation schema
  - `generateArticleSchema()` - For blog posts (future use)

### 3. SEO Service
- **Location**: `lib/seoService.ts`
- **Purpose**: Manage global SEO settings in Firebase
- **Features**: Save/load SEO settings, social media links, verification codes, analytics IDs

### 4. Admin SEO Settings Page
- **Location**: `app/admin/dashboard/seo/page.tsx`
- **Access**: Admin Dashboard → SEO Settings
- **Features**:
  - Global site SEO settings (name, description, keywords)
  - Social media URL management
  - Search engine verification codes
  - Analytics tracking IDs

### 5. Page-Level SEO Implementation

All pages now include:
- ✅ Dynamic metadata exports
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Canonical URLs
- ✅ Structured data (JSON-LD)
- ✅ Breadcrumb navigation schema

**Pages Updated**:
- Home (`app/page.tsx`)
- Services (`app/services/[slug]/page.tsx`)
- Staff (`app/staff/[slug]/page.tsx`)
- About (`app/about/page.tsx`)
- Contact (`app/contact/page.tsx`)

### 6. Technical SEO

#### Sitemap
- **Location**: `app/sitemap.ts`
- **URL**: `https://www.gardenias-healthcare.net/sitemap.xml`
- **Features**:
  - Automatically includes all static pages
  - Dynamically includes all active services
  - Dynamically includes all active staff members
  - Proper priority and change frequency settings

#### Robots.txt
- **Location**: `app/robots.ts`
- **URL**: `https://www.gardenias-healthcare.net/robots.txt`
- **Features**:
  - Allows all public pages
  - Blocks admin and API routes
  - Points to sitemap.xml

## How to Update SEO

### Global SEO Settings

1. Go to **Admin Dashboard** → **SEO Settings**
2. Update:
   - Site name, description, keywords
   - Social media URLs
   - Search engine verification codes
   - Analytics tracking IDs
3. Click **Save SEO Settings**

### Individual Page SEO

#### Services
1. Go to **Admin Dashboard** → **Services**
2. Edit a service
3. Navigate to **SEO & Meta** tab
4. Update:
   - SEO Title
   - SEO Description
   - Keywords
5. Save the service

#### Categories
1. Go to **Admin Dashboard** → **Categories**
2. Edit a category
3. Navigate to **SEO & Settings** tab
4. Update:
   - SEO Title
   - SEO Description
5. Save the category

#### Staff
- Currently uses auto-generated SEO from staff name, title, and bio
- Can be extended to add custom SEO fields if needed

## SEO Best Practices Implemented

✅ **Meta Tags**
- Unique titles for each page
- Descriptive meta descriptions (150-160 characters)
- Relevant keywords
- Proper robots directives

✅ **Open Graph Tags**
- Title, description, image for social sharing
- Proper og:type for different page types
- og:locale for location targeting

✅ **Twitter Cards**
- Large image cards for better visibility
- Proper card type configuration

✅ **Structured Data (JSON-LD)**
- Organization schema on homepage
- Service schema on service pages
- Person schema on staff pages
- Breadcrumb schema on all pages

✅ **Canonical URLs**
- Prevents duplicate content issues
- Proper URL structure

✅ **Technical SEO**
- Sitemap.xml for search engines
- Robots.txt for crawl control
- Mobile-friendly (already implemented)

## Schema Types Used

1. **MedicalBusiness** - Organization schema for the clinic
2. **Service** - For individual service pages
3. **Person** - For staff member pages
4. **BreadcrumbList** - Navigation breadcrumbs
5. **Article** - Available for blog posts (future use)

## Domain Configuration

The SEO system is configured for:
- **Domain**: `https://www.gardenias-healthcare.net`
- **Location**: Milton, Ontario, Canada
- **Language**: English (en-CA)

To change the domain, update `lib/seo/config.ts`.

## Future Enhancements

- [ ] Add FAQ schema for services
- [ ] Add Review/Rating schema
- [ ] Add Event schema for appointments
- [ ] Add BlogPost schema for blog integration
- [ ] Add SEO preview tool in admin
- [ ] Add automatic keyword suggestions

## Testing SEO

### Check Metadata
1. View page source
2. Check `<head>` section for:
   - `<title>` tag
   - `<meta name="description">`
   - Open Graph tags (`og:*`)
   - Twitter Card tags (`twitter:*`)
   - Canonical URL

### Check Structured Data
1. Use [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter page URL
3. Verify all schemas are valid

### Check Sitemap
1. Visit `https://www.gardenias-healthcare.net/sitemap.xml`
2. Verify all pages are listed
3. Check URLs are correct

### Check Robots.txt
1. Visit `https://www.gardenias-healthcare.net/robots.txt`
2. Verify admin routes are blocked
3. Verify sitemap is referenced

## Notes

- SEO settings are stored in Firebase under `seoSettings/global`
- Changes to SEO settings take effect immediately
- Individual page SEO can be updated through their respective admin forms
- Structured data is automatically generated based on page type
- All SEO is optimized for mobile and desktop


