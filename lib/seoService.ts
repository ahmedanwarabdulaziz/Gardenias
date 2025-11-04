import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import AuthService from './auth';
import { SITE_CONFIG } from './seo/config';

export interface SEOSettings {
  // Global SEO Settings
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  defaultOgImage: string;
  
  // Social Media URLs
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  
  // Verification Codes
  googleVerification?: string;
  bingVerification?: string;
  yandexVerification?: string;
  
  // Business Info (can override config)
  businessHours?: {
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  
  // Analytics
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  
  // Updated timestamp
  updatedAt: Date;
}

export class SEOService {
  private static readonly COLLECTION_NAME = 'seoSettings';
  private static readonly DOCUMENT_ID = 'global';

  // Ensure authentication
  private static async ensureAuth(): Promise<void> {
    const isAuthenticated = AuthService.hasAdminAccess();
    if (!isAuthenticated) {
      throw new Error('Admin authentication required');
    }
    console.log('Admin authentication verified for SEO settings');
  }

  // Get SEO settings
  static async getSEOSettings(): Promise<SEOSettings> {
    try {
      const seoRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const seoSnap = await getDoc(seoRef);

      if (seoSnap.exists()) {
        const data = seoSnap.data();
        return {
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SEOSettings;
      }

      // Return defaults if no settings exist
      return {
        siteName: SITE_CONFIG.name,
        siteDescription: SITE_CONFIG.defaultDescription,
        siteKeywords: [...SITE_CONFIG.defaultKeywords],
        defaultOgImage: SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logoo.png`,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      // Return defaults on error
      return {
        siteName: SITE_CONFIG.name,
        siteDescription: SITE_CONFIG.defaultDescription,
        siteKeywords: [...SITE_CONFIG.defaultKeywords],
        defaultOgImage: SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logoo.png`,
        updatedAt: new Date(),
      };
    }
  }

  // Update SEO settings
  static async updateSEOSettings(settings: Partial<SEOSettings>): Promise<void> {
    try {
      await this.ensureAuth();

      const seoRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const currentSettings = await this.getSEOSettings();

      await setDoc(
        seoRef,
        {
          ...currentSettings,
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('SEO settings updated successfully');
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      throw new Error('Failed to update SEO settings');
    }
  }
}


