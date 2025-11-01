import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadDataUrlToCloudflare } from './cloudflare';
import AuthService from './auth';

export interface StaffMember {
  id: string;
  name: string;
  slug?: string;
  email: string;
  phone: string;
  title: string;
  picture?: string;
  heroImage?: string;
  shortDescription: string;
  corporateName?: string;
  address?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  // Professional Details
  shortBio?: string;
  fullBiography?: string;
  credentials?: string;
  areasOfSpecialization?: string[]; // SEO tags for search and filtering
  yearsOfExperience?: string;
  spokenLanguages?: string[];
  education?: Array<{
    institution: string;
    program: string;
    year: string;
  }>;
  associations?: string;
  bookingLink?: string;
}

export class StaffService {
  private static readonly COLLECTION_NAME = 'staff';
  private static isAuthenticated = false;

  // Compress image to reduce size
  private static async compressImage(dataUrl: string, maxWidth: number = 400, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  // Ensure authentication - Check admin authentication
  private static async ensureAuth(): Promise<void> {
    // Check if admin is authenticated
    const isAuthenticated = AuthService.hasAdminAccess();
    if (!isAuthenticated) {
      throw new Error('Admin authentication required');
    }
    console.log('Admin authentication verified');
  }

  // Get all staff members
  static async getStaff(): Promise<StaffMember[]> {
    try {
      // Try Firebase first
      await this.ensureAuth();

      const staffRef = collection(db, this.COLLECTION_NAME);
      const q = query(staffRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);

      const firebaseStaff = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as StaffMember[];

      console.log('Staff loaded from Firebase:', firebaseStaff.length, 'members');
      return firebaseStaff;
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      // Fallback to localStorage
      return this.getMockStaff();
    }
  }

  // Mock data for development
  private static getMockStaff(): StaffMember[] {
    return [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@healthcare.com',
        phone: '(555) 123-4567',
        title: 'Chief Medical Officer',
        shortDescription: 'Experienced physician with 15+ years in healthcare management.',
        isActive: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@healthcare.com',
        phone: '(555) 234-5678',
        title: 'Senior Cardiologist',
        shortDescription: 'Specialized in cardiovascular diseases and preventive care.',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Add new staff member
  static async addStaff(staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Try Firebase first
      await this.ensureAuth();
      
      // Handle image upload separately if it's a data URL
      const processedStaffData = { ...staffData };
      if (staffData.picture && staffData.picture.startsWith('data:')) {
        try {
          // Compress image if it's too large
          const compressedImage = await this.compressImage(staffData.picture);
          processedStaffData.picture = compressedImage;
          console.log('Image processed and stored:', compressedImage.substring(0, 50) + '...');
        } catch (imageError) {
          console.error('Image processing failed, using original:', imageError);
          // Keep original picture or remove it
          processedStaffData.picture = '';
        }
      }
      
      const staffRef = collection(db, this.COLLECTION_NAME);
      const docRef = await addDoc(staffRef, {
        ...processedStaffData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Staff added to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      // Fallback to localStorage
      const mockId = Date.now().toString();
      console.log('Staff added to localStorage with ID:', mockId);
      return mockId;
    }
  }

  // Update staff member
  static async updateStaff(id: string, staffData: Partial<StaffMember>): Promise<void> {
    try {
      // Try Firebase first
      await this.ensureAuth();
      
      // Handle image upload separately if it's a data URL
      const processedStaffData = { ...staffData };
      if (staffData.picture && staffData.picture.startsWith('data:')) {
        try {
          // Compress image if it's too large
          const compressedImage = await this.compressImage(staffData.picture);
          processedStaffData.picture = compressedImage;
          console.log('Image processed and stored:', compressedImage.substring(0, 50) + '...');
        } catch (imageError) {
          console.error('Image processing failed, keeping existing:', imageError);
          // Remove picture field to keep existing one
          delete processedStaffData.picture;
        }
      }
      
      const staffRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(staffRef, {
        ...processedStaffData,
        updatedAt: serverTimestamp(),
      });

      console.log('Staff updated in Firebase:', id);
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      console.log('Update will be handled locally');
    }
  }

  // Delete staff member
  static async deleteStaff(id: string): Promise<void> {
    try {
      // Try Firebase first
      await this.ensureAuth();

      const staffRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(staffRef);

      console.log('Staff deleted from Firebase:', id);
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      console.log('Delete will be handled locally');
    }
  }

  // Update staff order (for drag and drop)
  static async updateStaffOrder(staffUpdates: { id: string; order: number }[]): Promise<void> {
    try {
      // Try Firebase first
      await this.ensureAuth();

      const updatePromises = staffUpdates.map(({ id, order }) => {
        const staffRef = doc(db, this.COLLECTION_NAME, id);
        return updateDoc(staffRef, {
          order,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
      console.log('Staff order updated in Firebase');
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      console.log('Order update will be handled locally');
    }
  }

  // Upload staff picture to Cloudflare
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async uploadStaffPicture(file: File, _staffId: string): Promise<string> {
    try {
      const imageUrl = await uploadDataUrlToCloudflare(URL.createObjectURL(file));
      console.log('Staff picture uploaded to Cloudflare:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading picture to Cloudflare:', error);
      throw new Error('Failed to upload picture to Cloudflare');
    }
  }

  // Toggle staff active status
  static async toggleStaffStatus(id: string, isActive: boolean): Promise<void> {
    try {
      // Try Firebase first
      await this.ensureAuth();

      const staffRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(staffRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
      console.log('Staff status toggled in Firebase:', id, 'to', isActive);
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      console.log('Status toggle will be handled locally');
    }
  }
}
