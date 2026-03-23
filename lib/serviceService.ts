import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import AuthService from './auth';

export interface Service {
  id: string;
  // Basic Information
  name: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  isActive: boolean;
  
  // Session & Pricing
  sessionDurations: { duration: number; price: number }[];
  taxType: 'non-taxable' | 'taxable';
  bufferTime?: number;
  packageOptions?: { title: string; sessions: number; price: number }[];
  specialOffer?: string;
  
  // Audience & Treatment Details
  whoItsFor: string[];
  commonConditions: string[];
  expectedBenefits: string[];
  contraindications: string[];
  whenToSeeDoctor?: string;
  
  // Session Experience
  firstVisitOverview: string;
  whatToWear: string[];
  aftercareAdvice: string[];
  
  // Visuals & Media
  heroImage?: string; // Base64 data URL
  galleryImages?: string[]; // Base64 data URLs
  icon?: string; // Base64 data URL
  videoLink?: string;
  
  // Staff & Availability
  practitioners: string[]; // Staff IDs
  
  // Booking & Integration
  bookingLink?: string;
  preBookingNote?: string;
  postBookingInstructions?: string;
  squareMapping?: {
    squareItemId: string;
    squareItemName: string;
    variations: Array<{
      variationId: string;
      variationName: string;
      version: string;
      durationMinutes: number | null;
      priceCents: number | null;
      currency: string;
    }>;
  };
  
  // SEO & Meta
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  slug: string;
  
  // Internal & Compliance
  insuranceCoverage: boolean;
  insuranceNotes?: string;
  directBilling: boolean;
  cancellationPolicy?: string;
  internalNotes?: string;
  
  // Display & Ordering
  displayOrder: number;
  
  // Auto fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class ServiceService {
  private static readonly COLLECTION_NAME = 'services';

  // Compress image to reduce size
  private static async compressImage(dataUrl: string, maxWidth: number = 800, quality: number = 0.6): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Use more aggressive compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // If still too large, reduce quality further
        if (compressedDataUrl.length > 1000000) { // 1MB limit for maximum quality
          const furtherCompressed = canvas.toDataURL('image/jpeg', 0.75);
          resolve(furtherCompressed);
        } else {
          resolve(compressedDataUrl);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  // Check if document size is within Firestore limits
  private static checkDocumentSize(data: unknown): boolean {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const maxSize = 1048487; // Firestore limit
    
    console.log(`Document size: ${sizeInBytes} bytes (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB)`);
    
    if (sizeInBytes > maxSize) {
      console.warn(`Document size exceeds Firestore limit: ${sizeInBytes} > ${maxSize}`);
      return false;
    }
    
    return true;
  }

  // Ensure authentication - Check admin authentication
  private static async ensureAuth(): Promise<void> {
    const isAuthenticated = AuthService.hasAdminAccess();
    if (!isAuthenticated) {
      throw new Error('Admin authentication required');
    }
  }

  // Generate a URL-friendly slug from a string
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
  }

  // Get all services
  static async getServices(): Promise<Service[]> {
    try {
      await this.ensureAuth();
      const servicesRef = collection(db, this.COLLECTION_NAME);
      const q = query(servicesRef, orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        displayOrder: doc.data().displayOrder ?? 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Service[];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  // Get a single service by ID
  static async getService(id: string): Promise<Service | null> {
    try {
      await this.ensureAuth();
      const docSnap = await getDocs(query(collection(db, this.COLLECTION_NAME), where('id', '==', id)));
      if (!docSnap.empty) {
        const data = docSnap.docs[0].data();
        return {
          id: docSnap.docs[0].id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Service;
      }
      return null;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  // Get a single service by slug
  static async getServiceBySlug(slug: string): Promise<Service | null> {
    try {
      const servicesRef = collection(db, this.COLLECTION_NAME);
      const q = query(servicesRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Service;
      }
      return null;
    } catch (error) {
      console.error('Error fetching service by slug:', error);
      throw error;
    }
  }

  // Add new service
  static async addService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('ServiceService.addService called with:', serviceData);
    try {
      await this.ensureAuth();
      console.log('Authentication successful');

      const processedServiceData = { ...serviceData };

      // Handle image compression
      if (processedServiceData.heroImage && processedServiceData.heroImage.startsWith('data:')) {
        try {
          const compressedHero = await this.compressImage(processedServiceData.heroImage, 1920, 0.9);
          processedServiceData.heroImage = compressedHero;
        } catch (imageError) {
          console.error('Hero image compression failed, using original or removing:', imageError);
          processedServiceData.heroImage = '';
        }
      }

      if (processedServiceData.icon && processedServiceData.icon.startsWith('data:')) {
        try {
          const compressedIcon = await this.compressImage(processedServiceData.icon, 600, 0.6);
          processedServiceData.icon = compressedIcon;
        } catch (imageError) {
          console.error('Icon compression failed, using original or removing:', imageError);
          processedServiceData.icon = '';
        }
      }

      // Compress gallery images
      if (processedServiceData.galleryImages && processedServiceData.galleryImages.length > 0) {
        const compressedGallery = [];
        for (const image of processedServiceData.galleryImages) {
          if (image.startsWith('data:')) {
            try {
              const compressed = await this.compressImage(image, 800, 0.6);
              compressedGallery.push(compressed);
            } catch (imageError) {
              console.error('Gallery image compression failed:', imageError);
              compressedGallery.push(image);
            }
          } else {
            compressedGallery.push(image);
          }
        }
        processedServiceData.galleryImages = compressedGallery;
      }

      // Check document size before saving
      if (!this.checkDocumentSize(processedServiceData)) {
        throw new Error('Service data is too large for Firestore. Please reduce image sizes or remove some images.');
      }

      // Always generate slug from name to ensure it's up to date
      processedServiceData.slug = this.generateSlug(processedServiceData.name);

      // Set displayOrder if not provided (add to end of list)
      if (processedServiceData.displayOrder === undefined) {
        const servicesRef = collection(db, this.COLLECTION_NAME);
        const querySnapshot = await getDocs(servicesRef);
        processedServiceData.displayOrder = querySnapshot.size;
      }

      const servicesRef = collection(db, this.COLLECTION_NAME);
      console.log('Adding to Firebase collection:', this.COLLECTION_NAME);
      console.log('Data to add:', processedServiceData);

      const docRef = await addDoc(servicesRef, {
        ...processedServiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Service added to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      const mockId = Date.now().toString();
      console.log('Service added to localStorage with ID:', mockId);
      return mockId;
    }
  }

  // Update service
  static async updateService(id: string, serviceData: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      await this.ensureAuth();

      const processedServiceData = { ...serviceData };

      // Auto-generate slug from name if name is being updated
      if (processedServiceData.name) {
        processedServiceData.slug = this.generateSlug(processedServiceData.name);
      }

      // Handle image compression if updated
      if (processedServiceData.heroImage && processedServiceData.heroImage.startsWith('data:')) {
        try {
          const compressedHero = await this.compressImage(processedServiceData.heroImage, 1920, 0.9);
          processedServiceData.heroImage = compressedHero;
        } catch (imageError) {
          console.error('Hero image compression failed, keeping existing:', imageError);
          delete processedServiceData.heroImage; // Keep existing if compression fails
        }
      }

      if (processedServiceData.icon && processedServiceData.icon.startsWith('data:')) {
        try {
          const compressedIcon = await this.compressImage(processedServiceData.icon, 600, 0.6);
          processedServiceData.icon = compressedIcon;
        } catch (imageError) {
          console.error('Icon compression failed, keeping existing:', imageError);
          delete processedServiceData.icon; // Keep existing if compression fails
        }
      }

      // Compress gallery images if updated
      if (processedServiceData.galleryImages && processedServiceData.galleryImages.length > 0) {
        const compressedGallery = [];
        for (const image of processedServiceData.galleryImages) {
          if (image.startsWith('data:')) {
            try {
              const compressed = await this.compressImage(image, 800, 0.6);
              compressedGallery.push(compressed);
            } catch (imageError) {
              console.error('Gallery image compression failed:', imageError);
              compressedGallery.push(image);
            }
          } else {
            compressedGallery.push(image);
          }
        }
        processedServiceData.galleryImages = compressedGallery;
      }

      // Check document size before saving
      if (!this.checkDocumentSize(processedServiceData)) {
        throw new Error('Service data is too large for Firestore. Please reduce image sizes or remove some images.');
      }

      const serviceRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(serviceRef, {
        ...processedServiceData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Delete service
  static async deleteService(id: string): Promise<void> {
    try {
      await this.ensureAuth();
      const serviceRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(serviceRef);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Update display order for multiple services
  static async updateDisplayOrder(services: { id: string; displayOrder: number }[]): Promise<void> {
    try {
      await this.ensureAuth();
      
      // Update all services in parallel
      const updatePromises = services.map(({ id, displayOrder }) => {
        const serviceRef = doc(db, this.COLLECTION_NAME, id);
        return updateDoc(serviceRef, {
          displayOrder,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
      console.log('Display order updated successfully');
    } catch (error) {
      console.error('Error updating display order:', error);
      throw error;
    }
  }
}
