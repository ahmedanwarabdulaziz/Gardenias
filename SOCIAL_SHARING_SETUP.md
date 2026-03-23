# Social Media Sharing Configuration

## ✅ Default Social Sharing Image

The logo image (`/images/logoo.png`) is now configured as the default thumbnail for all social media sharing platforms including:

- **Facebook** - Open Graph image
- **Twitter/X** - Twitter Card image
- **WhatsApp** - Link preview image
- **LinkedIn** - Link preview image
- **Other platforms** - Open Graph standard

## 🔧 Configuration

### Default Image Location
- **File**: `/public/images/logoo.png`
- **URL**: `https://www.gardenias-healthcare.net/images/logoo.png`
- **Size**: Recommended 1200x630px for optimal display

### How It Works

1. **Root Layout** (`app/layout.tsx`)
   - Sets default Open Graph metadata
   - Sets default Twitter Card metadata
   - All pages inherit this unless overridden

2. **SEO Utilities** (`lib/seo/utils.ts`)
   - `generateMetadata()` function automatically uses default image
   - Pages can override with custom images
   - Falls back to default if no image specified

3. **Page-Specific Images**
   - Service pages: Use service hero image if available, fallback to logo
   - Staff pages: Use staff picture if available, fallback to logo
   - All other pages: Use logo by default

## 📱 Testing Social Sharing

### Facebook/WhatsApp
1. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your page URL
3. Click "Scrape Again" to refresh cache
4. Verify image appears correctly

### Twitter/X
1. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter your page URL
3. Verify image appears correctly

### WhatsApp
1. Share the URL in WhatsApp
2. The preview should show the logo image

## 🎯 Image Requirements

For best results, ensure:
- **Format**: PNG or JPG
- **Size**: 1200x630px (recommended)
- **File Size**: Under 1MB
- **Absolute URL**: Must be full URL (https://...)

## 📝 Notes

- The logo image is set as the default for all pages
- Individual pages can override with their own images
- Social media platforms cache images, so changes may take time to appear
- Use sharing debuggers to clear cache and see updates immediately

