'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import BrandTypography from '@/components/shared/BrandTypography';
import { SEOService, SEOSettings } from '@/lib/seoService';
import { SITE_CONFIG } from '@/lib/seo/config';
import { ServiceService, Service } from '@/lib/serviceService';
import { CategoryService, Category } from '@/lib/categoryService';
import { StaffService, StaffMember } from '@/lib/staffService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';

export default function SEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SEOSettings>>({
    siteName: SITE_CONFIG.name,
    siteDescription: SITE_CONFIG.defaultDescription,
    siteKeywords: [...SITE_CONFIG.defaultKeywords],
    defaultOgImage: SITE_CONFIG.defaultImage || `${SITE_CONFIG.baseUrl}/images/logoo.png`,
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Keywords overview data
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  useEffect(() => {
    loadSEOSettings();
    loadKeywordsData();
  }, []);

  const loadKeywordsData = async () => {
    try {
      setKeywordsLoading(true);
      const [servicesData, categoriesData, staffData] = await Promise.all([
        ServiceService.getServices(),
        CategoryService.getCategories(),
        StaffService.getStaff(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
      setStaff(staffData);
    } catch (err) {
      console.error('Error loading keywords data:', err);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const loadSEOSettings = async () => {
    try {
      setLoading(true);
      const settings = await SEOService.getSEOSettings();
      setFormData(settings);
    } catch (err) {
      console.error('Error loading SEO settings:', err);
      setError('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SEOSettings) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    setSuccess(false);
    setError(null);
  };

  const handleKeywordsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKeywordInput(value);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.siteKeywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        siteKeywords: [...(prev.siteKeywords || []), keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      siteKeywords: prev.siteKeywords?.filter(k => k !== keyword) || [],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await SEOService.updateSEOSettings(formData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving SEO settings:', err);
      setError('Failed to save SEO settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <BrandTypography variant="header" sx={{ mb: 1, color: 'primary.main' }}>
          SEO Settings
        </BrandTypography>
        <BrandTypography variant="text" sx={{ color: 'text.secondary' }}>
          Manage global SEO settings, social media links, verification codes, and analytics tracking
        </BrandTypography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          SEO settings saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Basic SEO Settings */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
            <Box>
              <BrandTypography variant="subheader" sx={{ color: 'primary.main', mb: 0.5 }}>
                Basic SEO Settings
              </BrandTypography>
              <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                Core SEO information used across all pages
              </BrandTypography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Site Name"
              fullWidth
              value={formData.siteName || ''}
              onChange={handleChange('siteName')}
              helperText="The name of your website (appears in search results)"
            />

            <TextField
              label="Site Description"
              fullWidth
              multiline
              rows={3}
              value={formData.siteDescription || ''}
              onChange={handleChange('siteDescription')}
              helperText="Default meta description (150-160 characters recommended)"
            />

            <Box>
              <TextField
                label="Keywords"
                fullWidth
                value={keywordInput}
                onChange={handleKeywordsChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                helperText="Press Enter or click Add to add keywords"
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {formData.siteKeywords?.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    onDelete={() => removeKeyword(keyword)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Default Open Graph Image URL"
              fullWidth
              value={formData.defaultOgImage || ''}
              onChange={handleChange('defaultOgImage')}
              helperText="Default image URL for social media sharing (1200x630px recommended)"
            />
          </Box>
        </Paper>

        {/* Social Media Links */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
            <Box>
              <BrandTypography variant="subheader" sx={{ color: 'primary.main', mb: 0.5 }}>
                Social Media Links
              </BrandTypography>
              <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                URLs for your social media profiles (used in structured data)
              </BrandTypography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Facebook URL"
              fullWidth
              type="url"
              value={formData.facebookUrl || ''}
              onChange={handleChange('facebookUrl')}
              placeholder="https://facebook.com/yourpage"
            />

            <TextField
              label="Twitter/X URL"
              fullWidth
              type="url"
              value={formData.twitterUrl || ''}
              onChange={handleChange('twitterUrl')}
              placeholder="https://twitter.com/yourhandle"
            />

            <TextField
              label="Instagram URL"
              fullWidth
              type="url"
              value={formData.instagramUrl || ''}
              onChange={handleChange('instagramUrl')}
              placeholder="https://instagram.com/yourhandle"
            />

            <TextField
              label="LinkedIn URL"
              fullWidth
              type="url"
              value={formData.linkedinUrl || ''}
              onChange={handleChange('linkedinUrl')}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </Box>
        </Paper>

        {/* Search Engine Verification */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
            <Box>
              <BrandTypography variant="subheader" sx={{ color: 'primary.main', mb: 0.5 }}>
                Search Engine Verification
              </BrandTypography>
              <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                Verification codes from Google Search Console, Bing Webmaster Tools, etc.
              </BrandTypography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Google Search Console Verification Code"
              fullWidth
              value={formData.googleVerification || ''}
              onChange={handleChange('googleVerification')}
              helperText="Content value from Google meta verification tag"
            />

            <TextField
              label="Bing Webmaster Tools Verification Code"
              fullWidth
              value={formData.bingVerification || ''}
              onChange={handleChange('bingVerification')}
              helperText="Content value from Bing meta verification tag"
            />

            <TextField
              label="Yandex Verification Code"
              fullWidth
              value={formData.yandexVerification || ''}
              onChange={handleChange('yandexVerification')}
              helperText="Content value from Yandex meta verification tag"
            />
          </Box>
        </Paper>

        {/* Analytics */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
            <Box>
              <BrandTypography variant="subheader" sx={{ color: 'primary.main', mb: 0.5 }}>
                Analytics & Tracking
              </BrandTypography>
              <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                Analytics IDs for tracking website performance
              </BrandTypography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Google Analytics ID (GA4)"
              fullWidth
              value={formData.googleAnalyticsId || ''}
              onChange={handleChange('googleAnalyticsId')}
              placeholder="G-XXXXXXXXXX"
              helperText="Your Google Analytics 4 measurement ID"
            />

            <TextField
              label="Google Tag Manager ID"
              fullWidth
              value={formData.googleTagManagerId || ''}
              onChange={handleChange('googleTagManagerId')}
              placeholder="GTM-XXXXXXX"
              helperText="Your Google Tag Manager container ID"
            />

            <TextField
              label="Facebook Pixel ID"
              fullWidth
              value={formData.facebookPixelId || ''}
              onChange={handleChange('facebookPixelId')}
              placeholder="123456789012345"
              helperText="Your Facebook Pixel ID for tracking"
            />
          </Box>
        </Paper>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => loadSEOSettings()}
            disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save SEO Settings'}
          </Button>
        </Box>
      </Box>

      {/* Keywords Overview Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
          <Box>
            <BrandTypography variant="subheader" sx={{ color: 'primary.main', mb: 0.5 }}>
              Keywords Overview
            </BrandTypography>
            <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
              View keywords for all pages across your website
            </BrandTypography>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Services" />
          <Tab label="Categories" />
          <Tab label="Staff" />
          <Tab label="Static Pages" />
        </Tabs>

        {keywordsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Services Keywords Tab */}
            {activeTab === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Service Name</strong></TableCell>
                      <TableCell><strong>URL Slug</strong></TableCell>
                      <TableCell><strong>Keywords</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <BrandTypography variant="text" sx={{ color: 'text.secondary' }}>
                            No services found
                          </BrandTypography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>{service.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={`/services/${service.slug}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontFamily: 'monospace' }}
                            />
                          </TableCell>
                          <TableCell>
                            {service.keywords && service.keywords.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {service.keywords.map((keyword, index) => (
                                  <Chip
                                    key={index}
                                    label={keyword}
                                    size="small"
                                    color="primary"
                                    variant="filled"
                                  />
                                ))}
                              </Box>
                            ) : (
                              <BrandTypography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                No keywords set
                              </BrandTypography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={service.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={service.isActive ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Categories Keywords Tab */}
            {activeTab === 1 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Category Name</strong></TableCell>
                      <TableCell><strong>URL Slug</strong></TableCell>
                      <TableCell><strong>SEO Keywords</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <BrandTypography variant="text" sx={{ color: 'text.secondary' }}>
                            No categories found
                          </BrandTypography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={`/services?category=${category.slug}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontFamily: 'monospace' }}
                            />
                          </TableCell>
                          <TableCell>
                            {category.seoTitle || category.seoDescription ? (
                              <BrandTypography variant="caption" sx={{ color: 'text.secondary' }}>
                                SEO fields set (keywords derived from content)
                              </BrandTypography>
                            ) : (
                              <BrandTypography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                No SEO fields set
                              </BrandTypography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={category.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={category.isActive ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Staff Keywords Tab */}
            {activeTab === 2 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Staff Name</strong></TableCell>
                      <TableCell><strong>URL Slug</strong></TableCell>
                      <TableCell><strong>Auto-Generated Keywords</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <BrandTypography variant="text" sx={{ color: 'text.secondary' }}>
                            No staff members found
                          </BrandTypography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      staff.map((member) => {
                        const autoKeywords = [
                          member.name,
                          member.title,
                          'Gardenias Healthcare',
                          'Milton',
                          'Ontario',
                          ...(member.areasOfSpecialization || []),
                        ];
                        return (
                          <TableRow key={member.id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={`/staff/${member.slug || member.id}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontFamily: 'monospace' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {autoKeywords.slice(0, 5).map((keyword, index) => (
                                  <Chip
                                    key={index}
                                    label={keyword}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                ))}
                                {autoKeywords.length > 5 && (
                                  <Chip
                                    label={`+${autoKeywords.length - 5} more`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={member.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                color={member.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Static Pages Keywords Tab */}
            {activeTab === 3 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Page Name</strong></TableCell>
                      <TableCell><strong>URL</strong></TableCell>
                      <TableCell><strong>Keywords</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Home</TableCell>
                      <TableCell>
                        <Chip
                          label="/"
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {['healthcare Milton', 'massage therapy Milton', 'reflexology Milton', 'naturopathic medicine', 'healthcare clinic Milton Ontario'].map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              color="primary"
                              variant="filled"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>About Us</TableCell>
                      <TableCell>
                        <Chip
                          label="/about"
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {['about Gardenias Healthcare', 'healthcare clinic Milton', 'Milton healthcare', 'medical clinic Milton Ontario'].map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              color="primary"
                              variant="filled"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Contact</TableCell>
                      <TableCell>
                        <Chip
                          label="/contact"
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {['contact Gardenias Healthcare', 'Milton healthcare contact', 'book appointment Milton', 'healthcare clinic Milton'].map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              color="primary"
                              variant="filled"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Services Listing</TableCell>
                      <TableCell>
                        <Chip
                          label="/services"
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </TableCell>
                      <TableCell>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          Uses global default keywords
                        </BrandTypography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Staff Listing</TableCell>
                      <TableCell>
                        <Chip
                          label="/staff"
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </TableCell>
                      <TableCell>
                        <BrandTypography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          Uses global default keywords
                        </BrandTypography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}

