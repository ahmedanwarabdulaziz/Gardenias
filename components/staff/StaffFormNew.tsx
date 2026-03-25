'use client';

import { useState, useCallback } from 'react';
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import BrandButton from '@/components/shared/BrandButton';
import BrandTypography from '@/components/shared/BrandTypography';

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  picture?: string;
  heroImage?: string;
  shortDescription: string;
  corporateName?: string;
  address?: string;
  isActive: boolean;
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
  slug?: string;
  bookingLink?: string;
}

interface StaffFormProps {
  staff?: StaffFormData | null;
  onSave: (data: StaffFormData) => void;
  onCancel: () => void;
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const validateTitle = (title: string): boolean => {
  return title.trim().length >= 2;
};

const validateDescription = (description: string): boolean => {
  return description.trim().length >= 10;
};

const validateShortBio = (bio: string): boolean => {
  const length = bio.trim().length;
  return length >= 220 && length <= 300;
};

const validateFullBiography = (biography: string): boolean => {
  const length = biography.trim().length;
  return length >= 800 && length <= 1200;
};

export default function StaffFormNew({ staff, onSave, onCancel }: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>(
    staff ? {
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      title: staff.title || '',
      picture: staff.picture || '',
      heroImage: staff.heroImage || '',
      shortDescription: staff.shortDescription || '',
      corporateName: staff.corporateName || '',
      address: staff.address || '',
      isActive: staff.isActive !== undefined ? staff.isActive : true,
      // Professional Details
      shortBio: staff.shortBio || '',
      fullBiography: staff.fullBiography || '',
      credentials: staff.credentials || '',
      areasOfSpecialization: staff.areasOfSpecialization || [],
      yearsOfExperience: staff.yearsOfExperience || '',
      spokenLanguages: staff.spokenLanguages || [],
      education: staff.education || [],
      associations: staff.associations || '',
      slug: staff.slug || '',
      bookingLink: staff.bookingLink || '',
    } : {
      name: '',
      email: '',
      phone: '',
      title: '',
      picture: '',
      heroImage: '',
      shortDescription: '',
      corporateName: '',
      address: '',
      isActive: true,
      // Professional Details
      shortBio: '',
      fullBiography: '',
      credentials: '',
      areasOfSpecialization: [],
      yearsOfExperience: '',
      spokenLanguages: [],
      education: [],
      associations: '',
      slug: '',
      bookingLink: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<keyof StaffFormData, boolean>>>({});
  
  // Dynamic field handlers
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleChange = (field: keyof StaffFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isActive: event.target.checked }));
  };

  // Helper functions for managing specialization list
  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData(prev => ({
        ...prev,
        areasOfSpecialization: [...(prev.areasOfSpecialization || []), newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      areasOfSpecialization: (prev.areasOfSpecialization || []).filter((_, i) => i !== index)
    }));
  };

  const validateField = (field: keyof StaffFormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!validateName(value)) return 'Name must be at least 2 characters';
        return undefined;
      
      case 'email':
        if (!value || !value.trim()) return undefined;
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return undefined;
      
      case 'phone':
        if (!value || !value.trim()) return undefined;
        if (!validatePhone(value)) return 'Please enter a valid phone number';
        return undefined;
      
      case 'title':
        if (!value || !value.trim()) return undefined;
        if (!validateTitle(value)) return 'Title must be at least 2 characters';
        return undefined;
      
      case 'shortDescription':
        if (!value || !value.trim()) return undefined;
        if (!validateDescription(value)) return 'Description must be at least 10 characters';
        return undefined;
      
      case 'shortBio':
        if (!value || !value.trim()) return undefined;
        if (!validateShortBio(value)) return 'Short bio must be 220-300 characters';
        return undefined;
      
      case 'fullBiography':
        if (!value || !value.trim()) return undefined;
        if (!validateFullBiography(value)) return 'Full biography must be 800-1200 characters';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof StaffFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field] as string);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, picture: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, picture: 'Image must be smaller than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, picture: reader.result as string }));
        setErrors(prev => ({ ...prev, picture: undefined }));
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, picture: 'Failed to read image file' }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const compressHeroImage = async (dataUrl: string, maxWidth: number = 1920, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress with high quality
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  const onDropHero = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, heroImage: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (10MB max for hero images)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, heroImage: 'Image must be smaller than 10MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Compress hero image with larger dimensions and higher quality
          const compressedImage = await compressHeroImage(reader.result as string, 1920, 0.9);
          setFormData(prev => ({ ...prev, heroImage: compressedImage }));
          setErrors(prev => ({ ...prev, heroImage: undefined }));
        } catch (error) {
          console.error('Hero image compression failed:', error);
          setErrors(prev => ({ ...prev, heroImage: 'Failed to process image' }));
        }
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, heroImage: 'Failed to read image file' }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.webp', '.jpg'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const { getRootProps: getHeroRootProps, getInputProps: getHeroInputProps, isDragActive: isHeroDragActive } = useDropzone({
    onDrop: onDropHero,
    accept: {
      'image/*': ['.jpeg', '.png', '.webp', '.jpg'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB for hero images
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
    
    // Validate required fields
    const requiredFields: (keyof StaffFormData)[] = ['name'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field] as string);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const getFieldError = (field: keyof StaffFormData): boolean => {
    return !!(touched[field] && errors[field]);
  };

  const getFieldHelperText = (field: keyof StaffFormData): string => {
    return (touched[field] && errors[field]) || '';
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '100%' }}>
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)} 
        sx={{ 
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 48,
          }
        }}
      >
        <Tab 
          label="Basic Information" 
          icon={<PersonIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Professional Details" 
          icon={<BusinessIcon />} 
          iconPosition="start"
        />
      </Tabs>

      {/* Basic Information Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Profile Picture Section - Centered */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                border: '2px dashed #e0e0e0',
                borderRadius: 3,
                backgroundColor: '#fafafa',
                maxWidth: 400,
                width: '100%'
              }}
            >
              <BrandTypography variant="subheader" sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhotoCameraIcon sx={{ mr: 1 }} />
                Profile Picture
              </BrandTypography>

              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #008d80',
                  borderRadius: 2,
                  p: 3,
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? '#f0f8f7' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0f8f7',
                    borderColor: '#006b5f',
                  },
                }}
              >
                <input {...getInputProps()} />
                <Avatar
                  src={formData.picture}
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'grey.200',
                    color: 'grey.600',
                    border: '3px solid #e0e0e0',
                  }}
                >
                  {!formData.picture && <PhotoCameraIcon sx={{ fontSize: 50 }} />}
                </Avatar>
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                  {isDragActive ? 'Drop image here' : 'Drag & drop or click to select'}
                </BrandTypography>
                <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  PNG, JPG, WEBP up to 5MB
                </BrandTypography>
              </Box>
              
              {errors.picture && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.picture}
                </Alert>
              )}
            </Paper>
          </Box>

          {/* Hero Image Section */}
          <Box sx={{ mb: 4 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                border: '2px dashed #e0e0e0',
                borderRadius: 3,
                backgroundColor: '#fafafa',
              }}
            >
              <BrandTypography variant="subheader" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PhotoCameraIcon sx={{ mr: 1 }} />
                Hero Image (for staff detail page)
              </BrandTypography>

              <Box
                {...getHeroRootProps()}
                sx={{
                  border: '2px dashed #008d80',
                  borderRadius: 2,
                  p: 3,
                  cursor: 'pointer',
                  backgroundColor: isHeroDragActive ? '#f0f8f7' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0f8f7',
                    borderColor: '#006b5f',
                  },
                }}
              >
                <input {...getHeroInputProps()} />
                {formData.heroImage ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundImage: `url(${formData.heroImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 2,
                      mb: 2,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 50, color: 'grey.500' }} />
                  </Box>
                )}
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
                  {isHeroDragActive ? 'Drop hero image here' : 'Drag & drop or click to select hero image'}
                </BrandTypography>
                <BrandTypography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                  Recommended: 1920x1080px or 16:9 ratio. PNG, JPG, WEBP up to 10MB
                </BrandTypography>
              </Box>
              
              {errors.heroImage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.heroImage}
                </Alert>
              )}
            </Paper>
          </Box>

          {/* Form Fields - One per row */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name Field */}
            <TextField
              fullWidth
              label="Full Name *"
              value={formData.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              error={getFieldError('name')}
              helperText={getFieldHelperText('name')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color={getFieldError('name') ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={getFieldError('email')}
              helperText={getFieldHelperText('email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color={getFieldError('email') ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Phone Field */}
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange('phone')}
              onBlur={handleBlur('phone')}
              error={getFieldError('phone')}
              helperText={getFieldHelperText('phone')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color={getFieldError('phone') ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Title Field */}
            <TextField
              fullWidth
              label="Job Title"
              value={formData.title}
              onChange={handleChange('title')}
              onBlur={handleBlur('title')}
              error={getFieldError('title')}
              helperText={getFieldHelperText('title')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color={getFieldError('title') ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Description Field */}
            <TextField
              fullWidth
              label="Professional Description"
              multiline
              rows={4}
              value={formData.shortDescription}
              onChange={handleChange('shortDescription')}
              onBlur={handleBlur('shortDescription')}
              error={getFieldError('shortDescription')}
              helperText={getFieldHelperText('shortDescription')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <DescriptionIcon color={getFieldError('shortDescription') ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Active Status */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      icon={formData.isActive ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={formData.isActive ? 'Active Staff Member' : 'Inactive Staff Member'}
                      color={formData.isActive ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ mr: 2 }}
                    />
                    <BrandTypography variant="text">
                      {formData.isActive ? 'This staff member is currently active' : 'This staff member is currently inactive'}
                    </BrandTypography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Professional Details Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Short Bio */}
            <TextField
              fullWidth
              label="Short Bio"
              multiline
              rows={3}
              value={formData.shortBio || ''}
              onChange={handleChange('shortBio')}
              onBlur={handleBlur('shortBio')}
              error={getFieldError('shortBio')}
              helperText={
                getFieldHelperText('shortBio') || 
                `${(formData.shortBio || '').length}/300 characters (220-300 optional)`
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Full Biography */}
            <TextField
              fullWidth
              label="Full Biography"
              multiline
              rows={6}
              value={formData.fullBiography || ''}
              onChange={handleChange('fullBiography')}
              onBlur={handleBlur('fullBiography')}
              error={getFieldError('fullBiography')}
              helperText={
                getFieldHelperText('fullBiography') || 
                `${(formData.fullBiography || '').length}/1200 characters (800-1200 optional)`
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Credentials & Licenses */}
            <TextField
              fullWidth
              label="Credentials & Licenses"
              multiline
              rows={3}
              value={formData.credentials || ''}
              onChange={handleChange('credentials')}
              helperText="List all professional designations with license numbers (e.g., Registered Massage Therapist – CMTO #12345)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <WorkIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Areas of Specialization - Tag-based */}
            <Box>
              <BrandTypography variant="text" sx={{ mb: 2, fontWeight: 600 }}>
                Areas of Specialization (Tags)
              </BrandTypography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add specialization area"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  helperText="Add specific areas of specialization for SEO and search filtering"
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
                    onClick={addSpecialization}
                    variant="outlined"
                    sx={{
                      borderColor: '#008d80',
                      color: '#008d80',
                      '&:hover': {
                        borderColor: '#006d5f',
                        backgroundColor: '#f0f9f8',
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {(formData.areasOfSpecialization || []).map((specialization, index) => (
                  <Chip
                    key={index}
                    label={specialization}
                    onDelete={() => removeSpecialization(index)}
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
              {(formData.areasOfSpecialization || []).length === 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    No specialization areas added yet. Add specific areas for better SEO and search filtering.
                  </BrandTypography>
                </Box>
              )}
            </Box>

            {/* Years of Experience */}
            <TextField
              fullWidth
              label="Years of Experience"
              value={formData.yearsOfExperience || ''}
              onChange={handleChange('yearsOfExperience')}
              helperText="Numeric or range (e.g., '10 years +')"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Spoken Languages */}
            <FormControl fullWidth>
              <InputLabel 
                id="spoken-languages-label"
                sx={{
                  '&.Mui-focused': {
                    color: '#008d80',
                  },
                }}
              >
                Spoken Languages
              </InputLabel>
              <Select
                labelId="spoken-languages-label"
                multiple
                value={formData.spokenLanguages || []}
                onChange={(e) => setFormData(prev => ({ ...prev, spokenLanguages: e.target.value as string[] }))}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#008d80',
                      borderWidth: 2,
                    },
                    '& fieldset': {
                      borderColor: '#c4c4c4',
                    },
                    '&:hover fieldset': {
                      borderColor: '#008d80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#008d80',
                    },
                  },
                }}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Arabic">Arabic</MenuItem>
                <MenuItem value="Mandarin">Mandarin</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="French">French</MenuItem>
                <MenuItem value="German">German</MenuItem>
                <MenuItem value="Italian">Italian</MenuItem>
                <MenuItem value="Portuguese">Portuguese</MenuItem>
                <MenuItem value="Russian">Russian</MenuItem>
                <MenuItem value="Japanese">Japanese</MenuItem>
                <MenuItem value="Korean">Korean</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Education & Certifications */}
            <Box>
              <BrandTypography variant="subheader" sx={{ mb: 2 }}>
                Education & Certifications
              </BrandTypography>
              {(formData.education || []).map((edu, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const newEducation = [...(formData.education || [])];
                      newEducation[index] = { ...edu, institution: e.target.value };
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Program/Qualification"
                    value={edu.program}
                    onChange={(e) => {
                      const newEducation = [...(formData.education || [])];
                      newEducation[index] = { ...edu, program: e.target.value };
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Year"
                    value={edu.year}
                    onChange={(e) => {
                      const newEducation = [...(formData.education || [])];
                      newEducation[index] = { ...edu, year: e.target.value };
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    sx={{ width: 120 }}
                  />
                  <Button
                    onClick={() => {
                      const newEducation = (formData.education || []).filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    color="error"
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    education: [...(prev.education || []), { institution: '', program: '', year: '' }]
                  }));
                }}
                variant="outlined"
                startIcon={<WorkIcon />}
              >
                Add Education Entry
              </Button>
            </Box>

            {/* Associations / Registrations */}
            <TextField
              fullWidth
              label="Professional Associations / Registrations"
              multiline
              rows={3}
              value={formData.associations || ''}
              onChange={handleChange('associations')}
              helperText="List all professional bodies or colleges (e.g., College of Massage Therapists of Ontario)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Corporate Name and Address (moved from Basic Info) */}
            <Divider sx={{ my: 2 }} />
            <BrandTypography variant="subheader" sx={{ mb: 2 }}>
              Additional Information
            </BrandTypography>

            {/* Slug Field */}
            <TextField
              fullWidth
              label="URL Slug (for staff page)"
              value={formData.slug || ''}
              onChange={handleChange('slug')}
              helperText="URL-friendly name (e.g., 'dr-john-smith'). Leave empty to auto-generate from name."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            {/* Booking Link Field */}
            <TextField
              fullWidth
              label="Booking Link"
              value={formData.bookingLink || ''}
              onChange={handleChange('bookingLink')}
              helperText="Direct link to book appointment with this staff member"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            <TextField
              fullWidth
              label="Corporate Name"
              value={formData.corporateName || ''}
              onChange={handleChange('corporateName')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />

            <TextField
              fullWidth
              label="Address"
              value={formData.address || ''}
              onChange={handleChange('address')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#008d80',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#008d80',
                },
              }}
            />
          </Box>
        </Box>
      </TabPanel>

      {/* Action Buttons */}
      <Box sx={{ 
        mt: 4, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2,
        pt: 3,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <BrandButton 
          variant="secondary" 
          onClick={onCancel}
          startIcon={<CancelIcon />}
        >
          Cancel
        </BrandButton>
        <BrandButton 
          variant="primary" 
          type="submit"
          startIcon={<SaveIcon />}
        >
          {staff ? 'Update Staff Member' : 'Add Staff Member'}
        </BrandButton>
      </Box>
    </Box>
  );
}
