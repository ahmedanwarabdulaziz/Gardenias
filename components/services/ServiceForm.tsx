'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Paper,
  FormControlLabel,
  Switch,
  InputAdornment,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  ListItemText,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import BrandTypography from '@/components/shared/BrandTypography';
import { Service } from '@/lib/serviceService';
import { Category } from '@/lib/categoryService';
import { StaffMember } from '@/lib/staffService';
import { getImageSizeInfo, formatFileSize, validateImageSize } from '@/lib/imageUtils';

export interface ServiceFormData {
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
  heroImage?: string;
  galleryImages?: string[];
  icon?: string;
  videoLink?: string;
  
  // Staff & Availability
  practitioners: string[];
  
  // Booking & Integration
  bookingLink?: string;
  preBookingNote?: string;
  postBookingInstructions?: string;
  
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
  createdBy: string;
}

interface ServiceFormProps {
  service?: Service | null;
  onSave: (data: ServiceFormData) => void;
  onCancel: () => void;
  categories: Category[];
  staff: StaffMember[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
}

// Types for Square service staff
interface SquareStaffMember {
  id: string;
  displayName: string;
  jobTitle: string;
}

interface SquareVariationStaff {
  variationId: string;
  variationName: string;
  durationMinutes: number | null;
  priceCents: number | null;
  currency: string;
  teamMembers: SquareStaffMember[];
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes < 60) return `${minutes}min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
}

function formatPrice(cents: number | null, currency: string): string {
  if (cents === null) return '';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency || 'CAD',
  }).format(cents / 100);
}

// Component to fetch and display staff assigned to a specific service in Square
function ServiceStaffFromSquare({ service }: { service: Service | null }) {
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<SquareVariationStaff[]>([]);
  const [allStaff, setAllStaff] = useState<SquareStaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const squareItemId = service?.squareMapping?.squareItemId;
    if (!squareItemId) {
      setVariations([]);
      setAllStaff([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/square/service-staff?itemId=${squareItemId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setVariations(data.variations || []);
          setAllStaff(data.staff || []);
        }
      })
      .catch(() => setError('Failed to fetch staff from Square'))
      .finally(() => setLoading(false));
  }, [service?.squareMapping?.squareItemId]);

  if (!service?.squareMapping) {
    return (
      <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, textAlign: 'center' }}>
        <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
        <BrandTypography variant="text" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Not linked to Square
        </BrandTypography>
        <BrandTypography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Link this service to a Square service on the Square Integration page first.
        </BrandTypography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <BrandTypography variant="text" sx={{ color: 'text.secondary' }}>
          Loading staff from Square...
        </BrandTypography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: 'rgba(211,47,47,0.05)', borderRadius: 2, border: '1px solid rgba(211,47,47,0.2)' }}>
        <BrandTypography variant="caption" sx={{ color: '#d32f2f' }}>{error}</BrandTypography>
      </Box>
    );
  }

  // Show staff grouped by variation
  if (variations.length > 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {variations.map(variation => (
          <Box
            key={variation.variationId}
            sx={{
              p: 2,
              bgcolor: 'rgba(0,141,128,0.04)',
              borderRadius: 2,
              border: '1px solid rgba(0,141,128,0.15)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <BrandTypography variant="text" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {variation.variationName}
              </BrandTypography>
              {variation.durationMinutes && (
                <Chip
                  size="small"
                  label={formatDuration(variation.durationMinutes)}
                  sx={{ height: 22, fontSize: '0.75rem', bgcolor: 'rgba(0,141,128,0.1)', color: '#008d80' }}
                />
              )}
              {variation.priceCents !== null && (
                <Chip
                  size="small"
                  label={formatPrice(variation.priceCents, variation.currency)}
                  sx={{ height: 22, fontSize: '0.75rem', bgcolor: 'rgba(0,141,128,0.1)', color: '#008d80' }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {variation.teamMembers.length > 0 ? (
                variation.teamMembers.map(member => (
                  <Chip
                    key={member.id}
                    label={`${member.displayName}${member.jobTitle ? ` • ${member.jobTitle}` : ''}`}
                    sx={{
                      bgcolor: 'rgba(0,141,128,0.1)',
                      color: '#008d80',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      border: '1px solid rgba(0,141,128,0.2)',
                    }}
                  />
                ))
              ) : (
                <BrandTypography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No specific staff assigned — all team members may be available
                </BrandTypography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Fallback: show all staff for this service
  if (allStaff.length > 0) {
    return (
      <Box sx={{ p: 3, bgcolor: 'rgba(0,141,128,0.04)', borderRadius: 2, border: '1px dashed rgba(0,141,128,0.3)' }}>
        <BrandTypography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: '#008d80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Staff available for this service:
        </BrandTypography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {allStaff.map(member => (
            <Chip
              key={member.id}
              label={`${member.displayName}${member.jobTitle ? ` • ${member.jobTitle}` : ''}`}
              sx={{
                bgcolor: 'rgba(0,141,128,0.1)',
                color: '#008d80',
                fontWeight: 600,
                border: '1px solid rgba(0,141,128,0.2)',
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
      <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
        No staff assignments found for this service in Square.
      </BrandTypography>
    </Box>
  );
}

export default function ServiceForm({ service, onSave, onCancel, categories, staff }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>(
    service ? {
      name: service.name || '',
      shortDescription: service.shortDescription || '',
      fullDescription: service.fullDescription || '',
      categoryId: service.categoryId || '',
      isActive: service.isActive !== undefined ? service.isActive : true,
      sessionDurations: service.sessionDurations || [],
      taxType: service.taxType || 'non-taxable',
      bufferTime: service.bufferTime || 0,
      packageOptions: service.packageOptions || [],
      specialOffer: service.specialOffer || '',
      whoItsFor: service.whoItsFor || [],
      commonConditions: service.commonConditions || [],
      expectedBenefits: service.expectedBenefits || [],
      contraindications: service.contraindications || [],
      whenToSeeDoctor: service.whenToSeeDoctor || '',
      firstVisitOverview: service.firstVisitOverview || '',
      whatToWear: service.whatToWear || [],
      aftercareAdvice: service.aftercareAdvice || [],
      heroImage: service.heroImage || '',
      galleryImages: service.galleryImages || [],
      icon: service.icon || '',
      videoLink: service.videoLink || '',
      practitioners: service.practitioners || [],
      bookingLink: service.bookingLink || '',
      preBookingNote: service.preBookingNote || '',
      postBookingInstructions: service.postBookingInstructions || '',
      seoTitle: service.seoTitle || '',
      seoDescription: service.seoDescription || '',
      keywords: service.keywords || [],
      slug: service.slug || '',
      insuranceCoverage: service.insuranceCoverage || false,
      insuranceNotes: service.insuranceNotes || '',
      directBilling: service.directBilling || false,
      cancellationPolicy: service.cancellationPolicy || '',
      internalNotes: service.internalNotes || '',
      displayOrder: service.displayOrder || 0,
      createdBy: service.createdBy || '',
    } : {
      name: '',
      shortDescription: '',
      fullDescription: '',
      categoryId: '',
      isActive: true,
      sessionDurations: [],
      taxType: 'non-taxable',
      bufferTime: 0,
      packageOptions: [],
      specialOffer: '',
      whoItsFor: [],
      commonConditions: [],
      expectedBenefits: [],
      contraindications: [],
      whenToSeeDoctor: '',
      firstVisitOverview: '',
      whatToWear: [],
      aftercareAdvice: [],
      heroImage: '',
      galleryImages: [],
      icon: '',
      videoLink: '',
      practitioners: [],
      bookingLink: '',
      preBookingNote: '',
      postBookingInstructions: '',
      seoTitle: '',
      seoDescription: '',
      keywords: [],
      slug: '',
      insuranceCoverage: false,
      insuranceNotes: '',
      directBilling: false,
      cancellationPolicy: '',
      internalNotes: '',
      displayOrder: 0,
      createdBy: '',
    }
  );

  const [activeTab, setActiveTab] = useState(0);

  // Dynamic field handlers
  const [newDuration, setNewDuration] = useState({ duration: 30, price: 0 });
  const [newPackage, setNewPackage] = useState({ title: '', sessions: 1, price: 0 });
  const [newListItem, setNewListItem] = useState('');
  const [newWhoItsFor, setNewWhoItsFor] = useState('');
  const [newCommonCondition, setNewCommonCondition] = useState('');
  const [newExpectedBenefit, setNewExpectedBenefit] = useState('');
  const [newContraindication, setNewContraindication] = useState('');
  const [newWhatToWear, setNewWhatToWear] = useState('');
  const [newAftercareAdvice, setNewAftercareAdvice] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  // Update form data when service prop changes
  useEffect(() => {
    if (service) {
      console.log('ServiceForm: Loading service data:', service);
      console.log('ServiceForm: commonConditions:', service.commonConditions);
      setFormData({
        name: service.name || '',
        shortDescription: service.shortDescription || '',
        fullDescription: service.fullDescription || '',
        categoryId: service.categoryId || '',
        isActive: service.isActive !== undefined ? service.isActive : true,
        sessionDurations: service.sessionDurations || [],
        taxType: service.taxType || 'non-taxable',
        bufferTime: service.bufferTime || 0,
        packageOptions: service.packageOptions || [],
        specialOffer: service.specialOffer || '',
        whoItsFor: service.whoItsFor || [],
        commonConditions: service.commonConditions || [],
        expectedBenefits: service.expectedBenefits || [],
        contraindications: service.contraindications || [],
        whenToSeeDoctor: service.whenToSeeDoctor || '',
        firstVisitOverview: service.firstVisitOverview || '',
        whatToWear: service.whatToWear || [],
        aftercareAdvice: service.aftercareAdvice || [],
        heroImage: service.heroImage || '',
        galleryImages: service.galleryImages || [],
        icon: service.icon || '',
        videoLink: service.videoLink || '',
      practitioners: service.practitioners || [],
      bookingLink: service.bookingLink || '',
      preBookingNote: service.preBookingNote || '',
        postBookingInstructions: service.postBookingInstructions || '',
        seoTitle: service.seoTitle || '',
        seoDescription: service.seoDescription || '',
        keywords: service.keywords || [],
        slug: service.slug || '',
        insuranceCoverage: service.insuranceCoverage || false,
        insuranceNotes: service.insuranceNotes || '',
        directBilling: service.directBilling || false,
        cancellationPolicy: service.cancellationPolicy || '',
        internalNotes: service.internalNotes || '',
        displayOrder: service.displayOrder || 0,
        createdBy: service.createdBy || '',
      });
    }
  }, [service]);

  // Image upload handlers
  const onIconDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, icon: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onHeroDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, heroImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onGalleryDrop = useCallback((acceptedFiles: File[]) => {
    const files = acceptedFiles.slice(0, 4); // Max 4 images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ 
          ...prev, 
          galleryImages: [...(prev.galleryImages || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps: getIconRootProps, getInputProps: getIconInputProps, isDragActive: isIconDragActive } = useDropzone({
    onDrop: onIconDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.jpg'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const { getRootProps: getHeroRootProps, getInputProps: getHeroInputProps, isDragActive: isHeroDragActive } = useDropzone({
    onDrop: onHeroDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.jpg'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const { getRootProps: getGalleryRootProps, getInputProps: getGalleryInputProps, isDragActive: isGalleryDragActive } = useDropzone({
    onDrop: onGalleryDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.jpg'] },
    maxFiles: 4,
    maxSize: 5 * 1024 * 1024, // 5MB each
  });

  const handleChange = (prop: keyof ServiceFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value: string | boolean = event.target.value;
    
    if (prop === 'isActive' || prop === 'insuranceCoverage' || prop === 'directBilling') {
      value = (event.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({ ...prev, [prop]: value }));
  };

  const handleSelectChange = (prop: keyof ServiceFormData) => (event: { target: { value: string } }) => {
    setFormData(prev => ({ ...prev, [prop]: event.target.value }));
  };

  const handleArrayChange = (prop: keyof ServiceFormData, value: string[]) => {
    setFormData(prev => ({ ...prev, [prop]: value }));
  };

  const addDuration = () => {
    if (newDuration.duration > 0 && newDuration.price >= 0) {
      setFormData(prev => ({
        ...prev,
        sessionDurations: [...prev.sessionDurations, newDuration]
      }));
      setNewDuration({ duration: 30, price: 0 });
    }
  };

  const removeDuration = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sessionDurations: prev.sessionDurations.filter((_, i) => i !== index)
    }));
  };

  const addPackage = () => {
    if (newPackage.title && newPackage.sessions > 0 && newPackage.price >= 0) {
      setFormData(prev => ({
        ...prev,
        packageOptions: [...(prev.packageOptions || []), newPackage]
      }));
      setNewPackage({ title: '', sessions: 1, price: 0 });
    }
  };

  const removePackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packageOptions: prev.packageOptions?.filter((_, i) => i !== index) || []
    }));
  };

  const addListItem = (prop: keyof ServiceFormData, value?: string) => {
    const itemValue = value || newListItem;
    if (itemValue.trim()) {
      setFormData(prev => ({
        ...prev,
        [prop]: [...(prev[prop] as string[]), itemValue.trim()]
      }));
      if (!value) {
        setNewListItem('');
      }
    }
  };

  const removeListItem = (prop: keyof ServiceFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [prop]: (prev[prop] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      // Validate image sizes before saving
      const imageErrors: string[] = [];
      
      if (formData.heroImage && formData.heroImage.startsWith('data:')) {
        const heroSizeInfo = getImageSizeInfo(formData.heroImage);
        if (!validateImageSize(formData.heroImage, 1000)) {
          imageErrors.push(`Hero image is too large (${formatFileSize(heroSizeInfo.sizeInBytes)}). Please use a smaller image.`);
        }
      }
      
      if (formData.icon && formData.icon.startsWith('data:')) {
        const iconSizeInfo = getImageSizeInfo(formData.icon);
        if (!validateImageSize(formData.icon, 300)) {
          imageErrors.push(`Service icon is too large (${formatFileSize(iconSizeInfo.sizeInBytes)}). Please use a smaller image.`);
        }
      }
      
      if (formData.galleryImages && formData.galleryImages.length > 0) {
        formData.galleryImages.forEach((image, index) => {
          if (image.startsWith('data:')) {
            const gallerySizeInfo = getImageSizeInfo(image);
            if (!validateImageSize(image, 400)) {
              imageErrors.push(`Gallery image ${index + 1} is too large (${formatFileSize(gallerySizeInfo.sizeInBytes)}). Please use smaller images.`);
            }
          }
        });
      }
      
      if (imageErrors.length > 0) {
        alert(`Please fix the following image size issues:\n\n${imageErrors.join('\n')}`);
        return;
      }
      
      console.log('Form submitted with data:', formData);
      onSave(formData);
    } catch (error) {
      console.error('Error validating form data:', error);
      alert('There was an error validating the form. Please check your images and try again.');
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ bgcolor: 'primary.main', p: 3, color: 'white' }}>
          <BrandTypography variant="header" sx={{ color: 'white', mb: 1 }}>
            {service ? 'Edit Service' : 'Create New Service'}
          </BrandTypography>
          <BrandTypography variant="text" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {service ? 'Update service information and settings' : 'Add a new service to your healthcare system'}
          </BrandTypography>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 60,
            }
          }}
        >
          <Tab label="Basic Info" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="Audience & Treatment" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Session Experience" icon={<VisibilityIcon />} iconPosition="start" />
          <Tab label="Visuals & Media" icon={<PhotoCameraIcon />} iconPosition="start" />
          <Tab label="Staff & Availability" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="SEO & Meta" icon={<SearchIcon />} iconPosition="start" />
          <Tab label="Internal & Compliance" icon={<NotesIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Tab 1: Basic Information */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  Service Details
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Provide the essential information about this service
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <CategoryIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      Basic Information
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Core identity and content visible to clients
                    </BrandTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Service Name *"
                    placeholder="Enter service name (e.g., Acupressure Massage Therapy)"
                    value={formData.name}
                    onChange={handleChange('name')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Short Description *"
                    placeholder="One concise sentence used on service cards"
                    value={formData.shortDescription}
                    onChange={handleChange('shortDescription')}
                    helperText={`${formData.shortDescription.length}/300 characters`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Full Description *"
                    placeholder="2-4 short paragraphs describing the therapy, approach, and client benefits"
                    value={formData.fullDescription}
                    onChange={handleChange('fullDescription')}
                    helperText={`${formData.fullDescription.length}/1200 characters`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      value={formData.categoryId}
                      onChange={handleSelectChange('categoryId')}
                      label="Category *"
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={handleChange('isActive')}
                          color="primary"
                          size="medium"
                        />
                      }
                      label={
                        <Box>
                          <BrandTypography variant="text" sx={{ fontWeight: 600 }}>
                            Active Service
                          </BrandTypography>
                          <BrandTypography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {formData.isActive ? 'This service is visible to clients' : 'This service is hidden from clients'}
                          </BrandTypography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start' }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 2: Audience & Treatment Details */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  Audience & Treatment Details
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Educational and marketing clarity for service pages
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      Audience & Treatment Details
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Educational and marketing clarity on each service page
                    </BrandTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  {/* Who It&apos;s For - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Who It&apos;s For
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add target audience"
                        value={newWhoItsFor}
                        onChange={(e) => setNewWhoItsFor(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newWhoItsFor.trim()) {
                              addListItem('whoItsFor', newWhoItsFor.trim());
                              setNewWhoItsFor('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {formData.whoItsFor.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Chip
                            label={item}
                            onDelete={() => removeListItem('whoItsFor', index)}
                            color="primary"
                            variant="filled"
                            sx={{ 
                              maxWidth: 'fit-content',
                              bgcolor: '#008d80',
                              color: 'white',
                              '& .MuiChip-deleteIcon': {
                                color: 'white',
                                '&:hover': {
                                  color: 'rgba(255, 255, 255, 0.7)'
                                }
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                    {formData.whoItsFor.length === 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No target audience added yet. Add who this service is for.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>

                  {/* Common Conditions Addressed - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Common Conditions Addressed
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add condition"
                        value={newCommonCondition}
                        onChange={(e) => setNewCommonCondition(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newCommonCondition.trim()) {
                              addListItem('commonConditions', newCommonCondition.trim());
                              setNewCommonCondition('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {formData.commonConditions.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Chip
                            label={item}
                            onDelete={() => removeListItem('commonConditions', index)}
                            color="primary"
                            variant="filled"
                            sx={{ 
                              maxWidth: 'fit-content',
                              bgcolor: '#008d80',
                              color: 'white',
                              '& .MuiChip-deleteIcon': {
                                color: 'white',
                                '&:hover': {
                                  color: 'rgba(255, 255, 255, 0.7)'
                                }
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                    {formData.commonConditions.length === 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No conditions added yet. Add some common conditions that this service addresses.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>

                  {/* Expected Benefits - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Expected Benefits
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add benefit"
                        value={newExpectedBenefit}
                        onChange={(e) => setNewExpectedBenefit(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newExpectedBenefit.trim()) {
                              addListItem('expectedBenefits', newExpectedBenefit.trim());
                              setNewExpectedBenefit('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {formData.expectedBenefits.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item}
                            onDelete={() => removeListItem('expectedBenefits', index)}
                            color="success"
                            variant="outlined"
                            sx={{ maxWidth: 'fit-content' }}
                          />
                        </Box>
                      ))}
                    </Box>
                    {formData.expectedBenefits.length === 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No benefits added yet. Add the expected benefits of this service.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>

                  {/* Contraindications - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Contraindications / Who Should Not Book
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add contraindication"
                        value={newContraindication}
                        onChange={(e) => setNewContraindication(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newContraindication.trim()) {
                              addListItem('contraindications', newContraindication.trim());
                              setNewContraindication('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {formData.contraindications.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item}
                            onDelete={() => removeListItem('contraindications', index)}
                            color="error"
                            variant="outlined"
                            sx={{ maxWidth: 'fit-content' }}
                          />
                        </Box>
                      ))}
                    </Box>
                    {formData.contraindications.length === 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No contraindications added yet. Add who should not book this service.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>

                  {/* When to See a Doctor - Single Row */}
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="When to See a Doctor Instead (Optional)"
                    placeholder="Short paragraph about when clients should consult a doctor"
                    value={formData.whenToSeeDoctor || ''}
                    onChange={handleChange('whenToSeeDoctor')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 3: Session Experience */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  Session Experience
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Manage client expectations and post-care
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <VisibilityIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      Session Experience
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Manage client expectations and post-care
                    </BrandTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  {/* First Visit Overview - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      First Visit Overview
                    </BrandTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="First Visit Overview *"
                      placeholder="Short paragraph on what happens during first appointment"
                      value={formData.firstVisitOverview}
                      onChange={handleChange('firstVisitOverview')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1rem',
                          '&.Mui-focused fieldset': {
                            borderColor: '#008d80',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008d80',
                        },
                      }}
                    />
                  </Box>

                  {/* What to Wear / Bring - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      What to Wear / Bring
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add item"
                        value={newWhatToWear}
                        onChange={(e) => setNewWhatToWear(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newWhatToWear.trim()) {
                              addListItem('whatToWear', newWhatToWear.trim());
                              setNewWhatToWear('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {formData.whatToWear.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Chip
                            label={item}
                            onDelete={() => removeListItem('whatToWear', index)}
                            color="primary"
                            variant="filled"
                            sx={{ 
                              maxWidth: 'fit-content',
                              bgcolor: '#008d80',
                              color: 'white',
                              '& .MuiChip-deleteIcon': {
                                color: 'white',
                                '&:hover': {
                                  color: 'rgba(255, 255, 255, 0.7)'
                                }
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                    {formData.whatToWear.length === 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No items added yet. Add what clients should wear or bring to their appointment.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>

                  {/* Aftercare Advice - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Aftercare Advice
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add advice"
                        value={newAftercareAdvice}
                        onChange={(e) => setNewAftercareAdvice(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newAftercareAdvice.trim()) {
                              addListItem('aftercareAdvice', newAftercareAdvice.trim());
                              setNewAftercareAdvice('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {formData.aftercareAdvice.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Chip
                            label={item}
                            onDelete={() => removeListItem('aftercareAdvice', index)}
                            color="primary"
                            variant="filled"
                            sx={{ 
                              maxWidth: 'fit-content',
                              bgcolor: '#008d80',
                              color: 'white',
                              '& .MuiChip-deleteIcon': {
                                color: 'white',
                                '&:hover': {
                                  color: 'rgba(255, 255, 255, 0.7)'
                                }
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                    {formData.aftercareAdvice.length === 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No advice added yet. Add post-treatment care instructions for clients.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 4: Visuals & Media */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  Visuals & Media
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Image management for consistency and SEO
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PhotoCameraIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      Visuals & Media
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Image management for consistency and SEO
                    </BrandTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  {/* Hero Image - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Hero Image
                    </BrandTypography>
                    <Box
                      {...getHeroRootProps()}
                      sx={{
                        border: '2px dashed',
                        borderColor: isHeroDragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: isHeroDragActive ? 'primary.50' : 'grey.50',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                    >
                      <input {...getHeroInputProps()} />
                      {formData.heroImage ? (
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <Box sx={{ 
                            width: '100%', 
                            height: 200,
                            border: '2px solid',
                            borderColor: 'grey.200',
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: 'grey.50'
                          }}>
                            <Box
                              component="img"
                              src={formData.heroImage}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <PhotoCameraIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                            Drag & drop a hero image here, or click to select
                          </BrandTypography>
                        </Box>
                      )}
                      <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                        Hero banner format (1200×400 px recommended, 3:1 ratio, max 10MB)
                      </BrandTypography>
                    </Box>
                  </Box>

                  {/* Gallery Images - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Gallery Images (up to 4)
                    </BrandTypography>
                    <Box
                      {...getGalleryRootProps()}
                      sx={{
                        border: '2px dashed',
                        borderColor: isGalleryDragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: isGalleryDragActive ? 'primary.50' : 'grey.50',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                    >
                      <input {...getGalleryInputProps()} />
                      {formData.galleryImages && formData.galleryImages.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          {formData.galleryImages.map((image, index) => (
                            <Box key={index} sx={{ position: 'relative' }}>
                              <Box sx={{ 
                                width: 100, 
                                height: 100,
                                border: '2px solid',
                                borderColor: 'grey.200',
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                bgcolor: 'grey.50'
                              }}>
                                <Box
                                  component="img"
                                  src={image}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const newGallery = formData.galleryImages?.filter((_, i) => i !== index) || [];
                                  setFormData(prev => ({ ...prev, galleryImages: newGallery }));
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'error.dark' },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box>
                          <PhotoCameraIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                            Drag & drop gallery images here, or click to select
                          </BrandTypography>
                        </Box>
                      )}
                      <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                        Gallery format (800×600 px recommended, max 4 images, 5MB each)
                      </BrandTypography>
                    </Box>
                  </Box>

                  {/* Service Icon - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Service Icon
                    </BrandTypography>
                    <Box
                      {...getIconRootProps()}
                      sx={{
                        border: '2px dashed',
                        borderColor: isIconDragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: isIconDragActive ? 'primary.50' : 'grey.50',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                    >
                      <input {...getIconInputProps()} />
                      {formData.icon ? (
                        <Box sx={{ position: 'relative', mb: 2, display: 'flex', justifyContent: 'center' }}>
                          <Box sx={{ 
                            width: 100, 
                            height: 100,
                            border: '3px solid',
                            borderColor: 'grey.200',
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: 'grey.50',
                            boxShadow: 2
                          }}>
                            <Box
                              component="img"
                              src={formData.icon}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <PhotoCameraIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                            Drag & drop an icon here, or click to select
                          </BrandTypography>
                        </Box>
                      )}
                      <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                        Square image (200×200 px, 1:1 ratio, max 5MB)
                      </BrandTypography>
                    </Box>
                  </Box>

                  {/* Video Link - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Video Link (Optional)
                    </BrandTypography>
                    <TextField
                      fullWidth
                      label="Video Link (Optional)"
                      placeholder="YouTube, Vimeo, or other video URL"
                      value={formData.videoLink || ''}
                      onChange={handleChange('videoLink')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VideoIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1rem',
                          '&.Mui-focused fieldset': {
                            borderColor: '#008d80',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008d80',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 5: Staff & Availability (Read-only from Square) */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  Staff & Availability
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Staff assigned to this service in Square
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      Square Staff Assignments
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Showing staff assigned to this service in Square
                    </BrandTypography>
                  </Box>
                </Box>

                <ServiceStaffFromSquare service={service || null} />
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 6: SEO & Meta */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  SEO & Meta
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Search and sharing optimization
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <SearchIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      SEO & Meta
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Search and sharing optimization
                    </BrandTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  {/* SEO Title - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      SEO Title
                    </BrandTypography>
                    <TextField
                      fullWidth
                      label="SEO Title"
                      placeholder="Clean, human-readable title for search results"
                      value={formData.seoTitle || ''}
                      onChange={handleChange('seoTitle')}
                      helperText={`${(formData.seoTitle || '').length}/60 characters`}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1rem',
                          '&.Mui-focused fieldset': {
                            borderColor: '#008d80',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008d80',
                        },
                      }}
                    />
                  </Box>

                  {/* SEO Description - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      SEO Description
                    </BrandTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="SEO Description"
                      placeholder="Short meta text for Google snippets"
                      value={formData.seoDescription || ''}
                      onChange={handleChange('seoDescription')}
                      helperText={`${(formData.seoDescription || '').length}/150 characters`}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1rem',
                          '&.Mui-focused fieldset': {
                            borderColor: '#008d80',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008d80',
                        },
                      }}
                    />
                  </Box>

                  {/* Keywords / Tags - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Keywords / Tags
                    </BrandTypography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '&.Mui-focused fieldset': {
                              borderColor: '#008d80',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#008d80',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                        <Button 
                          onClick={() => {
                            if (newKeyword.trim()) {
                              const newKeywords = [...(formData.keywords || []), newKeyword.trim()];
                              setFormData(prev => ({ ...prev, keywords: newKeywords }));
                              setNewKeyword('');
                            }
                          }} 
                          variant="outlined"
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {formData.keywords?.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          onDelete={() => {
                            const newKeywords = formData.keywords?.filter((_, i) => i !== index) || [];
                            setFormData(prev => ({ ...prev, keywords: newKeywords }));
                          }}
                          color="primary"
                          variant="filled"
                          sx={{ 
                            bgcolor: '#008d80',
                            color: 'white',
                            '& .MuiChip-deleteIcon': {
                              color: 'white',
                              '&:hover': {
                                color: 'rgba(255, 255, 255, 0.7)'
                              }
                            }
                          }}
                        />
                      ))}
                    </Box>
                    {(!formData.keywords || formData.keywords.length === 0) && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                          No keywords added yet. Add relevant keywords for better search visibility.
                        </BrandTypography>
                      </Box>
                    )}
                  </Box>

                  {/* Slug / Page URL - Single Row */}
                  <Box>
                    <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                      Slug / Page URL
                    </BrandTypography>
                    <TextField
                      fullWidth
                      label="Slug / Page URL"
                      placeholder="Auto-generated from name, editable"
                      value={formData.slug}
                      onChange={handleChange('slug')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1rem',
                          '&.Mui-focused fieldset': {
                            borderColor: '#008d80',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008d80',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 7: Internal & Compliance */}
          <TabPanel value={activeTab} index={6}>
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
                  Internal & Compliance
                </BrandTypography>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
                  Operational record keeping
                </BrandTypography>
              </Box>

              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <NotesIcon />
                  </Avatar>
                  <Box>
                    <BrandTypography variant="subheader" sx={{ color: 'primary.main' }}>
                      Internal & Compliance
                    </BrandTypography>
                    <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                      Operational record keeping
                    </BrandTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.insuranceCoverage}
                        onChange={handleChange('insuranceCoverage')}
                        color="primary"
                        size="medium"
                      />
                    }
                    label={
                      <Box>
                        <BrandTypography variant="text" sx={{ fontWeight: 600 }}>
                          Insurance Coverage
                        </BrandTypography>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {formData.insuranceCoverage ? 'This service is covered by insurance' : 'This service is not covered by insurance'}
                        </BrandTypography>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', mt: 1 }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.directBilling}
                        onChange={handleChange('directBilling')}
                        color="primary"
                        size="medium"
                      />
                    }
                    label={
                      <Box>
                        <BrandTypography variant="text" sx={{ fontWeight: 600 }}>
                          Direct Billing Available
                        </BrandTypography>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {formData.directBilling ? 'Direct billing is available' : 'Direct billing is not available'}
                        </BrandTypography>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', mt: 1 }}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Insurance Notes"
                    placeholder="Additional information about insurance coverage"
                    value={formData.insuranceNotes || ''}
                    onChange={handleChange('insuranceNotes')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Cancellation Policy"
                    placeholder="Service-specific cancellation policy"
                    value={formData.cancellationPolicy || ''}
                    onChange={handleChange('cancellationPolicy')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Internal Notes (Admin Only)"
                    placeholder="Internal remarks or updates (not visible to clients)"
                    value={formData.internalNotes || ''}
                    onChange={handleChange('internalNotes')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#008d80',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#008d80',
                      },
                    }}
                  />
                </Box>
              </Box>
              </Paper>
            </Box>
          </TabPanel>
          
        </Box>

        {/* Action Buttons */}
        <Box sx={{
          bgcolor: 'grey.50',
          p: 3,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <Box>
            <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
              {service ? 'Last updated: ' + new Date(service.updatedAt).toLocaleDateString() : 'Creating new service'}
            </BrandTypography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderColor: 'grey.300',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              type="submit"
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              {service ? 'Update Service' : 'Create Service'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
