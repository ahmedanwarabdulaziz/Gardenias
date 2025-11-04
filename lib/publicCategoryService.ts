import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface PublicCategory {
  id: string;
  name: string;
  shortDescription: string;
  icon?: string;
  accentColor: string;
  displayOrder: number;
  slug?: string;
}

export interface PublicService {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  sessionDurations: { duration: number; price: number }[];
  displayOrder: number;
  isActive: boolean;
  heroImage?: string;
  galleryImages?: string[];
  bookingLink?: string;
  slug?: string;
  whoItsFor?: string[];
  commonConditions?: string[];
  expectedBenefits?: string[];
  contraindications?: string[];
  whenToSeeDoctor?: string;
  firstVisitOverview?: string;
  whatToWear?: string[];
  aftercareAdvice?: string[];
  preBookingNote?: string;
  postBookingInstructions?: string;
  practitioners?: string[];
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

// Public service - no authentication required for website display
export class PublicCategoryService {
  // Get all active categories for public display
  static async getPublicCategories(): Promise<PublicCategory[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesRef);

      const categories = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          shortDescription: doc.data().shortDescription,
          icon: doc.data().icon,
          accentColor: doc.data().accentColor || '#008d80',
          displayOrder: doc.data().displayOrder || 0,
          isActive: doc.data().isActive,
          slug: doc.data().slug,
        }))
        .filter(cat => cat.isActive) // Filter active in memory
        .sort((a, b) => a.displayOrder - b.displayOrder); // Sort in memory

      return categories as PublicCategory[];
    } catch (error) {
      console.error('Error fetching public categories:', error);
      return [];
    }
  }

  // Get all active services for public display
  static async getPublicServices(): Promise<PublicService[]> {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      const services = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          shortDescription: doc.data().shortDescription,
          fullDescription: doc.data().fullDescription,
          categoryId: doc.data().categoryId,
          sessionDurations: doc.data().sessionDurations || [],
          isActive: doc.data().isActive,
          displayOrder: doc.data().displayOrder ?? 0,
          heroImage: doc.data().heroImage,
          galleryImages: doc.data().galleryImages || [],
          bookingLink: doc.data().bookingLink,
          slug: doc.data().slug,
          whoItsFor: doc.data().whoItsFor || [],
          commonConditions: doc.data().commonConditions || [],
          expectedBenefits: doc.data().expectedBenefits || [],
          contraindications: doc.data().contraindications || [],
          whenToSeeDoctor: doc.data().whenToSeeDoctor,
          firstVisitOverview: doc.data().firstVisitOverview,
          whatToWear: doc.data().whatToWear || [],
          aftercareAdvice: doc.data().aftercareAdvice || [],
          preBookingNote: doc.data().preBookingNote,
          postBookingInstructions: doc.data().postBookingInstructions,
          seoTitle: doc.data().seoTitle,
          seoDescription: doc.data().seoDescription,
          keywords: doc.data().keywords,
        }))
        .filter(service => service.isActive); // Filter active in memory

      return services as PublicService[];
    } catch (error) {
      console.error('Error fetching public services:', error);
      return [];
    }
  }

  // Get services by category
  static async getServicesByCategory(categoryId: string): Promise<PublicService[]> {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      const services = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          shortDescription: doc.data().shortDescription,
          fullDescription: doc.data().fullDescription,
          categoryId: doc.data().categoryId,
          sessionDurations: doc.data().sessionDurations || [],
          isActive: doc.data().isActive,
          displayOrder: doc.data().displayOrder ?? 0,
          heroImage: doc.data().heroImage,
          galleryImages: doc.data().galleryImages || [],
          bookingLink: doc.data().bookingLink,
          slug: doc.data().slug,
          whoItsFor: doc.data().whoItsFor || [],
          commonConditions: doc.data().commonConditions || [],
          expectedBenefits: doc.data().expectedBenefits || [],
          contraindications: doc.data().contraindications || [],
          whenToSeeDoctor: doc.data().whenToSeeDoctor,
          firstVisitOverview: doc.data().firstVisitOverview,
          whatToWear: doc.data().whatToWear || [],
          aftercareAdvice: doc.data().aftercareAdvice || [],
          preBookingNote: doc.data().preBookingNote,
          postBookingInstructions: doc.data().postBookingInstructions,
        }))
        .filter(service => service.categoryId === categoryId && service.isActive); // Filter in memory

      return services as PublicService[];
    } catch (error) {
      console.error('Error fetching services by category:', error);
      return [];
    }
  }

  // Get a single service by slug
  static async getServiceBySlug(slug: string): Promise<PublicService | null> {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const service = {
        id: doc.id,
        name: doc.data().name,
        shortDescription: doc.data().shortDescription,
        fullDescription: doc.data().fullDescription,
        categoryId: doc.data().categoryId,
        sessionDurations: doc.data().sessionDurations || [],
        isActive: doc.data().isActive,
        displayOrder: doc.data().displayOrder ?? 0,
        heroImage: doc.data().heroImage,
        galleryImages: doc.data().galleryImages || [],
        bookingLink: doc.data().bookingLink,
        slug: doc.data().slug,
        whoItsFor: doc.data().whoItsFor || [],
        commonConditions: doc.data().commonConditions || [],
        expectedBenefits: doc.data().expectedBenefits || [],
        contraindications: doc.data().contraindications || [],
        whenToSeeDoctor: doc.data().whenToSeeDoctor,
        firstVisitOverview: doc.data().firstVisitOverview,
        whatToWear: doc.data().whatToWear || [],
        aftercareAdvice: doc.data().aftercareAdvice || [],
        preBookingNote: doc.data().preBookingNote,
        postBookingInstructions: doc.data().postBookingInstructions,
        practitioners: doc.data().practitioners || [],
        seoTitle: doc.data().seoTitle,
        seoDescription: doc.data().seoDescription,
        keywords: doc.data().keywords,
      } as PublicService;

      return service.isActive ? service : null;
    } catch (error) {
      console.error('Error fetching service by slug:', error);
      return null;
    }
  }

  // Get services by staff member ID
  static async getServicesByStaffId(staffId: string): Promise<PublicService[]> {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      const services = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          shortDescription: doc.data().shortDescription,
          fullDescription: doc.data().fullDescription,
          categoryId: doc.data().categoryId,
          sessionDurations: doc.data().sessionDurations || [],
          isActive: doc.data().isActive,
          displayOrder: doc.data().displayOrder ?? 0,
          heroImage: doc.data().heroImage,
          galleryImages: doc.data().galleryImages || [],
          bookingLink: doc.data().bookingLink,
          slug: doc.data().slug,
          whoItsFor: doc.data().whoItsFor || [],
          commonConditions: doc.data().commonConditions || [],
          expectedBenefits: doc.data().expectedBenefits || [],
          contraindications: doc.data().contraindications || [],
          whenToSeeDoctor: doc.data().whenToSeeDoctor,
          firstVisitOverview: doc.data().firstVisitOverview,
          whatToWear: doc.data().whatToWear || [],
          aftercareAdvice: doc.data().aftercareAdvice || [],
          preBookingNote: doc.data().preBookingNote,
          postBookingInstructions: doc.data().postBookingInstructions,
          practitioners: doc.data().practitioners || [],
        }))
        .filter(service => {
          // Filter by active status and check if staff ID is in practitioners array
          return service.isActive && service.practitioners && service.practitioners.includes(staffId);
        });

      return services as PublicService[];
    } catch (error) {
      console.error('Error fetching services by staff ID:', error);
      return [];
    }
  }
}

