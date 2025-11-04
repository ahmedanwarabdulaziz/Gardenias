import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export interface PublicStaffMember {
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

// Public service - no authentication required for website display
export class PublicStaffService {
  // Get all active staff members for public display
  static async getPublicStaff(): Promise<PublicStaffMember[]> {
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);

      const staff = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          // Generate slug from name if not provided
          const slug = data.slug || generateSlug(data.name);
          return {
            id: doc.id,
            name: data.name,
            title: data.title,
            slug: slug,
            picture: data.picture,
            heroImage: data.heroImage,
            shortDescription: data.shortDescription,
            shortBio: data.shortBio,
            fullBiography: data.fullBiography,
            credentials: data.credentials,
            areasOfSpecialization: data.areasOfSpecialization || [],
            yearsOfExperience: data.yearsOfExperience,
            spokenLanguages: data.spokenLanguages || [],
            education: data.education || [],
            associations: data.associations,
            email: data.email,
            phone: data.phone,
            bookingLink: data.bookingLink,
            isActive: data.isActive,
            order: data.order ?? 0,
          };
        })
        .filter(member => member.isActive); // Filter active in memory

      return staff as PublicStaffMember[];
    } catch (error) {
      console.error('Error fetching public staff:', error);
      return [];
    }
  }

  // Get a single staff member by slug
  static async getStaffBySlug(slug: string): Promise<PublicStaffMember | null> {
    try {
      const allStaff = await this.getPublicStaff();
      // Only match by slug, not by ID (for professional URLs)
      const staff = allStaff.find(s => s.slug === slug);
      return staff || null;
    } catch (error) {
      console.error('Error fetching staff by slug:', error);
      return null;
    }
  }
}

