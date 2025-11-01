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
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Palette as PaletteIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Notes as NotesIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import BrandTypography from '@/components/shared/BrandTypography';
import { Category } from '@/lib/categoryService';

interface CategoryFormData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  isActive: boolean;
  // Visuals & Design
  icon?: string;
  cardBanner?: string;
  coverImage?: string;
  accentColor: string;
  displayOrder: number;
  // Meta & Additional Info
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  notes?: string;
}

interface CategoryFormProps {
  category?: Category | null;
  onSave: (data: CategoryFormData) => void;
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
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
}

// Validation functions
const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const validateShortDescription = (description: string): boolean => {
  return description.trim().length >= 10 && description.trim().length <= 200;
};

const validateFullDescription = (description: string): boolean => {
  return description.trim().length >= 50;
};

const validateSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};

const validateSeoDescription = (description: string): boolean => {
  return description.trim().length <= 160;
};

export default function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    category ? {
      name: category.name || '',
      shortDescription: category.shortDescription || '',
      fullDescription: category.fullDescription || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
      icon: category.icon || '',
      cardBanner: category.cardBanner || '',
      coverImage: category.coverImage || '',
      accentColor: category.accentColor || '#008d80',
      displayOrder: category.displayOrder || 0,
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || '',
      slug: category.slug || '',
      notes: category.notes || '',
    } : {
      name: '',
      shortDescription: '',
      fullDescription: '',
      isActive: true,
      icon: '',
      cardBanner: '',
      coverImage: '',
      accentColor: '#008d80',
      displayOrder: 0,
      seoTitle: '',
      seoDescription: '',
      slug: '',
      notes: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<keyof CategoryFormData, boolean>>>({});

  const handleChange =
    (prop: keyof CategoryFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [prop]: event.target.value });
      if (touched[prop]) {
        setErrors(prev => ({ ...prev, [prop]: validateField(prop, event.target.value) }));
      }
    };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: event.target.checked });
  };

  const validateField = (field: keyof CategoryFormData, value: string | boolean | number): string | undefined => {
    const strValue = String(value);
    switch (field) {
      case 'name':
        if (!strValue.trim()) return 'Category name is required';
        if (!validateName(strValue)) return 'Name must be at least 2 characters';
        return undefined;
      case 'shortDescription':
        if (!strValue.trim()) return 'Short description is required';
        if (!validateShortDescription(strValue)) return 'Description must be 10-200 characters';
        return undefined;
      case 'fullDescription':
        if (!strValue.trim()) return 'Full description is required';
        if (!validateFullDescription(strValue)) return 'Description must be at least 50 characters';
        return undefined;
      case 'slug':
        if (!strValue.trim()) return 'Slug is required';
        if (!validateSlug(strValue)) return 'Slug must contain only lowercase letters, numbers, and hyphens';
        return undefined;
      case 'seoDescription':
        if (strValue && !validateSeoDescription(strValue)) return 'SEO description must be 160 characters or less';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof CategoryFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field] || '') }));
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name), // Auto-generate slug if not manually set
    }));
    if (touched.name) {
      setErrors(prev => ({ ...prev, name: validateField('name', name) }));
    }
  };

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

  const onCardBannerDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, cardBanner: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onCoverDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getIconRootProps, getInputProps: getIconInputProps, isDragActive: isIconDragActive } = useDropzone({
    onDrop: onIconDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.webp', '.jpg'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const { getRootProps: getCardBannerRootProps, getInputProps: getCardBannerInputProps, isDragActive: isCardBannerDragActive } = useDropzone({
    onDrop: onCardBannerDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.webp', '.jpg'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.webp', '.jpg'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted with data:', formData);

    // Validate all fields
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof CategoryFormData;
      const error = validateField(field, formData[field] || '');
      if (error) {
        newErrors[field] = error;
      }
    });

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(newErrors).length === 0) {
      console.log('No validation errors, calling onSave');
      onSave(formData as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
    } else {
      console.log('Validation errors found, not saving');
    }
  };

  const getFieldError = (field: keyof CategoryFormData) => {
    return touched[field] ? errors[field] : undefined;
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
            {category ? 'Edit Category' : 'Create New Category'}
          </BrandTypography>
          <BrandTypography variant="text" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {category ? 'Update category information and settings' : 'Add a new service category to your healthcare system'}
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
          <Tab
            label="Basic Information"
            icon={<CategoryIcon />}
            iconPosition="start"
          />
          <Tab
            label="Visuals & Design"
            icon={<PaletteIcon />}
            iconPosition="start"
          />
          <Tab
            label="SEO & Settings"
            icon={<SearchIcon />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>

      {/* Tab 1: Basic Information */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
              Category Details
            </BrandTypography>
            <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
              Provide the essential information about this service category
            </BrandTypography>
          </Box>

          <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Category Name */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CategoryIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Category Name *
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    This will be the main title displayed on your website
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                placeholder="Enter category name (e.g., Massage Therapy)"
                value={formData.name}
                onChange={handleNameChange}
                onBlur={handleBlur('name')}
                error={!!getFieldError('name')}
                helperText={getFieldError('name')}
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
            </Paper>

            {/* Short Description */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DescriptionIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Short Description *
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    1-2 sentences that summarize the category&apos;s purpose (10-200 characters)
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                placeholder="Brief summary of this category's purpose and benefits"
                value={formData.shortDescription}
                onChange={handleChange('shortDescription')}
                onBlur={handleBlur('shortDescription')}
                error={!!getFieldError('shortDescription')}
                helperText={getFieldError('shortDescription')}
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
            </Paper>

            {/* Full Description */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DescriptionIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Full Description *
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    1-2 paragraphs explaining the philosophy, approach, and overall goal (minimum 50 characters)
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Detailed explanation of the philosophy, approach, and overall goal of this treatment category"
                value={formData.fullDescription}
                onChange={handleChange('fullDescription')}
                onBlur={handleBlur('fullDescription')}
                error={!!getFieldError('fullDescription')}
                helperText={getFieldError('fullDescription')}
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
            </Paper>

            {/* Status Toggle */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CategoryIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Category Status
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formData.isActive ? 'This category is visible to patients' : 'This category is hidden from patients'}
                  </BrandTypography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    color="primary"
                    size="medium"
                  />
                }
                label={
                  <BrandTypography variant="text" sx={{ fontWeight: 600 }}>
                    Active Category
                  </BrandTypography>
                }
                sx={{ alignItems: 'center' }}
              />
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab 2: Visuals & Design */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
              Visual Design
            </BrandTypography>
            <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
              Customize the visual appearance and branding for this category
            </BrandTypography>
          </Box>

          <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Icon Upload */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhotoCameraIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Category Icon
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Upload a square icon that represents this category
                  </BrandTypography>
                </Box>
              </Box>
              <Box
                {...getIconRootProps()}
                sx={{
                  border: '2px dashed #008d80',
                  borderRadius: 2,
                  p: 4,
                  cursor: 'pointer',
                  backgroundColor: isIconDragActive ? '#f0f8f7' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0f8f7',
                    borderColor: '#006b5f',
                  },
                  textAlign: 'center',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <input {...getIconInputProps()} />
                {formData.icon ? (
                  <Box sx={{ position: 'relative', mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ 
                      width: 150, 
                      height: 150, // Square (150x150)
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
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          const naturalWidth = img.naturalWidth;
                          const naturalHeight = img.naturalHeight;
                          const aspectRatio = naturalWidth / naturalHeight;
                          const targetAspectRatio = 1; // Square
                          
                          if (Math.abs(aspectRatio - targetAspectRatio) > 0.1) {
                            console.warn(`Icon aspect ratio mismatch: ${naturalWidth}x${naturalHeight} (${aspectRatio.toFixed(2)}) - Expected square (1.00)`);
                          }
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        p: 0.5,
                        textAlign: 'center',
                        fontSize: '0.75rem'
                      }}>
                        Icon Preview
                      </Box>
                    </Box>
                    <BrandTypography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 1, 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      width: '100%'
                    }}>
                      {formData.icon && (() => {
                        const img = new Image();
                        img.src = formData.icon;
                        return img.naturalWidth && img.naturalHeight 
                          ? `${img.naturalWidth}×${img.naturalHeight}` 
                          : 'Loading...';
                      })()}
                    </BrandTypography>
                  </Box>
                ) : (
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'grey.100',
                      color: 'grey.500',
                      border: '3px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                )}
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                  {formData.icon ? 'Click to change icon' : 'Drag & drop an icon here, or click to select'}
                </BrandTypography>
                <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  Square image (600×600 px, 1:1 ratio, max 5MB)
                </BrandTypography>
              </Box>
            </Paper>

            {/* Small Banner Upload */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ImageIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Card Banner (Optional)
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Small banner for category cards on the website (1/3 width)
                  </BrandTypography>
                </Box>
              </Box>
              <Box
                {...getCardBannerRootProps()}
                sx={{
                  border: '2px dashed #008d80',
                  borderRadius: 2,
                  p: 4,
                  cursor: 'pointer',
                  backgroundColor: isCardBannerDragActive ? '#f0f8f7' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0f8f7',
                    borderColor: '#006b5f',
                  },
                  textAlign: 'center',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <input {...getCardBannerInputProps()} />
                {formData.cardBanner ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{ 
                      width: '100%', 
                      maxWidth: 400, // 1/3 of typical screen width
                      height: 300, // 4:3 ratio (400x300)
                      border: '2px solid',
                      borderColor: 'grey.200',
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'grey.50',
                      mx: 'auto'
                    }}>
                      <Box
                        component="img"
                        src={formData.cardBanner}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          const naturalWidth = img.naturalWidth;
                          const naturalHeight = img.naturalHeight;
                          const aspectRatio = naturalWidth / naturalHeight;
                          const targetAspectRatio = 4/3; // 800x600 = 4:3 ratio
                          
                          if (Math.abs(aspectRatio - targetAspectRatio) > 0.2) {
                            console.warn(`Card banner aspect ratio mismatch: ${naturalWidth}x${naturalHeight} (${aspectRatio.toFixed(2)}) - Expected 4:3 ratio (1.33)`);
                          }
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        p: 0.5,
                        textAlign: 'center',
                        fontSize: '0.75rem'
                      }}>
                        Card Preview (1/3 width)
                      </Box>
                    </Box>
                    <BrandTypography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 1, 
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}>
                      {formData.cardBanner && (() => {
                        const img = new Image();
                        img.src = formData.cardBanner;
                        return img.naturalWidth && img.naturalHeight 
                          ? `${img.naturalWidth}×${img.naturalHeight}` 
                          : 'Loading...';
                      })()}
                    </BrandTypography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: 80, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2,
                    border: '2px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    position: 'relative',
                    '&::before': {
                      content: '"Card Banner Preview"',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'grey.400',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }
                  }}>
                    <ImageIcon sx={{ fontSize: 30, color: 'grey.400', opacity: 0.3 }} />
                  </Box>
                )}
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                  {formData.coverImage ? 'Click to change card banner' : 'Drag & drop a card banner here, or click to select'}
                </BrandTypography>
                <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  Card format (800×600 px recommended, 4:3 ratio, max 5MB)
                </BrandTypography>
              </Box>
            </Paper>

            {/* Cover Image Upload */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ImageIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Page Cover Image (Optional)
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Large banner image for the full category page
                  </BrandTypography>
                </Box>
              </Box>
              <Box
                {...getCoverRootProps()}
                sx={{
                  border: '2px dashed #008d80',
                  borderRadius: 2,
                  p: 4,
                  cursor: 'pointer',
                  backgroundColor: isCoverDragActive ? '#f0f8f7' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0f8f7',
                    borderColor: '#006b5f',
                  },
                  textAlign: 'center',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <input {...getCoverInputProps()} />
                {formData.coverImage ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: 225, // 16:9 ratio (400x225)
                      border: '2px solid',
                      borderColor: 'grey.200',
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'grey.50'
                    }}>
                      <Box
                        component="img"
                        src={formData.coverImage}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          const naturalWidth = img.naturalWidth;
                          const naturalHeight = img.naturalHeight;
                          const aspectRatio = naturalWidth / naturalHeight;
                          const targetAspectRatio = 16/9; // 1600x500 = 16:9 ratio
                          
                          if (Math.abs(aspectRatio - targetAspectRatio) > 0.3) {
                            console.warn(`Page cover aspect ratio mismatch: ${naturalWidth}x${naturalHeight} (${aspectRatio.toFixed(2)}) - Expected 16:9 ratio (1.78)`);
                          }
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        p: 1,
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        Hero Banner Preview (Full Width)
                      </Box>
                    </Box>
                    <BrandTypography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 1, 
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}>
                      {formData.coverImage && (() => {
                        const img = new Image();
                        img.src = formData.coverImage;
                        return img.naturalWidth && img.naturalHeight 
                          ? `${img.naturalWidth}×${img.naturalHeight}` 
                          : 'Loading...';
                      })()}
                    </BrandTypography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: 160, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2,
                    border: '2px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    position: 'relative',
                    '&::before': {
                      content: '"Banner Preview"',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'grey.400',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }
                  }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.400', opacity: 0.3 }} />
                  </Box>
                )}
                <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 1 }}>
                  {formData.coverImage ? 'Click to change banner image' : 'Drag & drop a banner image here, or click to select'}
                </BrandTypography>
                <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  Hero banner format (1600×500 px recommended, 16:9 ratio, max 10MB)
                </BrandTypography>
              </Box>
            </Paper>

            {/* Accent Color */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Accent Color
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Choose a color that represents this category
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                type="color"
                value={formData.accentColor}
                onChange={handleChange('accentColor')}
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
            </Paper>

            {/* Drag & Drop Order Info */}
            <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DragIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Category Order
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Use drag and drop on the main categories page to reorder categories
                  </BrandTypography>
                </Box>
              </Box>
              <BrandTypography variant="text" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                The display order is automatically managed through drag and drop functionality on the categories management page.
              </BrandTypography>
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab 3: SEO & Settings */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <BrandTypography variant="subheader" sx={{ mb: 2, color: 'primary.main' }}>
              SEO & Advanced Settings
            </BrandTypography>
            <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
              Configure search engine optimization and internal settings
            </BrandTypography>
          </Box>

          <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
            {/* SEO Title */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    SEO Title
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Custom title for search results (optional)
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                placeholder="Enter SEO title for search results"
                value={formData.seoTitle}
                onChange={handleChange('seoTitle')}
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
            </Paper>

            {/* SEO Description */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    SEO Description
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Meta description for search results (max 160 characters)
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description that appears in search results"
                value={formData.seoDescription}
                onChange={handleChange('seoDescription')}
                onBlur={handleBlur('seoDescription')}
                error={!!getFieldError('seoDescription')}
                helperText={getFieldError('seoDescription') || `${formData.seoDescription?.length || 0}/160 characters`}
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
            </Paper>

            {/* Slug */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LinkIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Page URL (Slug)
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    The URL path for this category page
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                placeholder="category-url-slug"
                value={formData.slug}
                onChange={handleChange('slug')}
                onBlur={handleBlur('slug')}
                error={!!getFieldError('slug')}
                helperText={getFieldError('slug') || 'Automatically generated from category name; editable if needed'}
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
            </Paper>

            {/* Admin Notes */}
            <Paper elevation={1} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotesIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Box>
                  <BrandTypography variant="subheader" sx={{ mb: 0.5, color: 'primary.main' }}>
                    Admin Notes
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                    Internal remarks or updates (not visible to patients)
                  </BrandTypography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add any internal notes or comments about this category..."
                value={formData.notes}
                onChange={handleChange('notes')}
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
            </Paper>
          </Box>
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
              {category ? 'Last updated: ' + new Date(category.updatedAt).toLocaleDateString() : 'Creating new category'}
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
              {category ? 'Update Category' : 'Create Category'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
