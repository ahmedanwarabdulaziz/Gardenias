/**
 * Server-side data fetching for Next.js App Router
 * These functions run on the server and can be used in Server Components
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ServerCategory {
  id: string;
  name: string;
  shortDescription: string;
  icon?: string;
  accentColor: string;
  displayOrder: number;
  slug?: string;
}

export interface ServerService {
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
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

/**
 * Fetch all active categories from Firestore (server-side)
 * Optimized with server-side filtering
 */
export async function getServerCategories(): Promise<ServerCategory[]> {
  try {
    const categoriesRef = collection(db, 'categories');
    
    // Filter active categories on the server side
    const q = query(
      categoriesRef,
      where('isActive', '==', true),
      orderBy('displayOrder', 'asc')
    );
    
    const querySnapshot = await getDocs(q);

    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      shortDescription: doc.data().shortDescription,
      icon: doc.data().icon,
      accentColor: doc.data().accentColor || '#008d80',
      displayOrder: doc.data().displayOrder || 0,
      slug: doc.data().slug,
    }));

    return categories as ServerCategory[];
  } catch (error) {
    console.error('Error fetching server categories:', error);
    // If query with filter fails (index missing), fallback to in-memory filter
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
        .filter(cat => cat.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      return categories as ServerCategory[];
    } catch (fallbackError) {
      console.error('Error in fallback category fetch:', fallbackError);
      return [];
    }
  }
}

/**
 * Fetch all active services from Firestore (server-side)
 * Optimized with server-side filtering
 */
export async function getServerServices(): Promise<ServerService[]> {
  try {
    const servicesRef = collection(db, 'services');
    
    // Filter active services on the server side
    const q = query(
      servicesRef,
      where('isActive', '==', true),
      orderBy('displayOrder', 'asc')
    );
    
    const querySnapshot = await getDocs(q);

    const services = querySnapshot.docs.map(doc => ({
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
    }));

    return services as ServerService[];
  } catch (error) {
    console.error('Error fetching server services:', error);
    // If query with filter fails (index missing), fallback to in-memory filter
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
        .filter(service => service.isActive);

      return services as ServerService[];
    } catch (fallbackError) {
      console.error('Error in fallback service fetch:', fallbackError);
      return [];
    }
  }
}

export interface ServerStaffMember {
  id: string;
  name: string;
  title: string;
  slug?: string;
  picture?: string;
  heroImage?: string;
  shortDescription: string;
  shortBio?: string;
  fullBiography?: string;
  credentials?: string;
  areasOfSpecialization?: string[];
  yearsOfExperience?: string;
  spokenLanguages?: string[];
  education?: Array<{
    institution: string;
    program: string;
    year: string;
  }>;
  associations?: string;
  email?: string;
  phone?: string;
  bookingLink?: string;
  order: number;
}

/**
 * Fetch all active staff members from Firestore (server-side)
 * Optimized with server-side filtering
 */
export async function getServerStaff(): Promise<ServerStaffMember[]> {
  try {
    const staffRef = collection(db, 'staff');
    
    // Filter active staff on the server side
    const q = query(
      staffRef,
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);

    const staff = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      title: doc.data().title,
      slug: doc.data().slug,
      picture: doc.data().picture,
      heroImage: doc.data().heroImage,
      shortDescription: doc.data().shortDescription,
      shortBio: doc.data().shortBio,
      fullBiography: doc.data().fullBiography,
      credentials: doc.data().credentials,
      areasOfSpecialization: doc.data().areasOfSpecialization || [],
      yearsOfExperience: doc.data().yearsOfExperience,
      spokenLanguages: doc.data().spokenLanguages || [],
      education: doc.data().education || [],
      associations: doc.data().associations,
      email: doc.data().email,
      phone: doc.data().phone,
      bookingLink: doc.data().bookingLink,
      order: doc.data().order ?? 0,
    }));

    return staff as ServerStaffMember[];
  } catch (error) {
    console.error('Error fetching server staff:', error);
    // If query with filter fails (index missing), fallback to in-memory filter
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);

      const staff = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          title: doc.data().title,
          slug: doc.data().slug,
          picture: doc.data().picture,
          heroImage: doc.data().heroImage,
          shortDescription: doc.data().shortDescription,
          shortBio: doc.data().shortBio,
          fullBiography: doc.data().fullBiography,
          credentials: doc.data().credentials,
          areasOfSpecialization: doc.data().areasOfSpecialization || [],
          yearsOfExperience: doc.data().yearsOfExperience,
          spokenLanguages: doc.data().spokenLanguages || [],
          education: doc.data().education || [],
          associations: doc.data().associations,
          email: doc.data().email,
          phone: doc.data().phone,
          bookingLink: doc.data().bookingLink,
          isActive: doc.data().isActive,
          order: doc.data().order ?? 0,
        }))
        .filter(member => member.isActive)
        .sort((a, b) => a.order - b.order);

      return staff as ServerStaffMember[];
    } catch (fallbackError) {
      console.error('Error in fallback staff fetch:', fallbackError);
      return [];
    }
  }
}

/**
 * Fetch both categories and services in parallel (server-side)
 * This is the recommended function to use for optimal performance
 */
export async function getServerData() {
  const [categories, services] = await Promise.all([
    getServerCategories(),
    getServerServices()
  ]);
  
  return { categories, services };
}

/**
 * Fetch all navigation data in parallel (server-side)
 * Optimized for header/navigation menus
 */
export async function getServerNavigationData() {
  const [categories, services, staff] = await Promise.all([
    getServerCategories(),
    getServerServices(),
    getServerStaff()
  ]);
  
  return { categories, services, staff };
}

