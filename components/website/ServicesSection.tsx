'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip } from '@mui/material';
import Link from 'next/link';
import { FirstAid, Heart, Activity, Brain, Baby, Barbell } from 'phosphor-react';
import { PublicCategory, PublicService } from '@/lib/publicCategoryService';
import { ServerCategory, ServerService } from '@/lib/serverDataService';

// Default icon mapping based on category name patterns
const getDefaultIcon = (categoryName: string, color: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('physio') || name.includes('therapy')) return <Barbell size={40} weight="duotone" color={color} />;
  if (name.includes('chiro') || name.includes('brain')) return <Brain size={40} weight="duotone" color={color} />;
  if (name.includes('massage') || name.includes('heart')) return <Heart size={40} weight="duotone" color={color} />;
  if (name.includes('acupuncture') || name.includes('aid')) return <FirstAid size={40} weight="duotone" color={color} />;
  if (name.includes('pediatric') || name.includes('baby')) return <Baby size={40} weight="duotone" color={color} />;
  if (name.includes('wellness') || name.includes('activity')) return <Activity size={40} weight="duotone" color={color} />;
  return <Activity size={40} weight="duotone" color={color} />;
};

interface ServicesSectionProps {
  initialCategories: ServerCategory[];
  initialServices: ServerService[];
}

export default function ServicesSection({ initialCategories, initialServices }: ServicesSectionProps) {
  // Convert server types to client types (they're compatible)
  const [categories, setCategories] = useState<PublicCategory[]>(initialCategories as PublicCategory[]);
  const [services, setServices] = useState<PublicService[]>(initialServices as PublicService[]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [displayedCategory, setDisplayedCategory] = useState<string>(''); // Category currently displayed
  const [isTransitioning, setIsTransitioning] = useState(false);
  const servicesListRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  // Set first category as default on mount
  useEffect(() => {
    if (initialCategories.length > 0 && !selectedCategory) {
      const firstCategoryId = initialCategories[0].id;
      setSelectedCategory(firstCategoryId);
      setDisplayedCategory(firstCategoryId);
    }
  }, [initialCategories, selectedCategory]);

  // Use displayedCategory for rendering to prevent content flash during transition
  const filteredServices = services.filter(service => service.categoryId === displayedCategory);
  const currentCategory = categories.find(c => c.id === displayedCategory);

  // Handle smooth transition and scroll when category changes
  useEffect(() => {
    if (shouldScrollRef.current && selectedCategory && selectedCategory !== displayedCategory) {
      // Start fade out transition
      setIsTransitioning(true);
      
      // After fade out completes, update displayed content
      setTimeout(() => {
        setDisplayedCategory(selectedCategory);
        
        // Fade in new content
        setTimeout(() => {
          setIsTransitioning(false);
          
          // Scroll to services list after transition
          setTimeout(() => {
            servicesListRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }, 50);
        }, 10); // Small delay to ensure DOM update
      }, 150); // Fade out duration (matches CSS transition)
      
      shouldScrollRef.current = false;
    }
  }, [selectedCategory, displayedCategory]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#f8faf9' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: '#008d80',
              mb: 2,
            }}
          >
            Gardenias Services
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              color: '#666',
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Explore our comprehensive range of healthcare services designed to meet your wellness needs
          </Typography>
        </Box>

        {/* Category Cards - Premium 5 Column Layout */}
        <Box sx={{ mb: 6, position: 'relative' }}>
          {/* Decorative background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #008d8020 0%, #008d8020 100%)',
              filter: 'blur(60px)',
              zIndex: 0,
            }}
          />
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(5, 1fr)',
              },
              gap: { xs: 2, md: 3 },
              position: 'relative',
              zIndex: 1,
            }}
          >
            {categories.map((category, index) => {
              const isSelected = selectedCategory === category.id;
              const backgroundImage = category.icon || '';

              return (
                <Box
                  key={category.id}
                  sx={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes fadeInUp': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(30px)',
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                  }}
                >
                  <Card
                    onClick={() => {
                      if (category.id !== selectedCategory) {
                        shouldScrollRef.current = true;
                        setSelectedCategory(category.id);
                      }
                    }}
                    sx={{
                      height: { xs: 140, md: 160 },
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      border: isSelected ? `3px solid ${category.accentColor}` : '2px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: isSelected 
                        ? `0 20px 40px ${category.accentColor}50, 0 0 0 3px ${category.accentColor}20, inset 0 1px 0 rgba(255,255,255,0.4)`
                        : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
                      transform: isSelected ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
                      // Glossy shine overlay
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isSelected 
                          ? `linear-gradient(135deg, ${category.accentColor}dd 0%, ${category.accentColor}bb 100%)`
                          : `linear-gradient(135deg, ${category.accentColor}40 0%, ${category.accentColor}60 100%)`,
                        zIndex: 1,
                        transition: 'all 0.3s ease',
                      },
                      // Glossy light reflection
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 3,
                        opacity: isSelected ? 0.4 : 0.25,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover': {
                        transform: isSelected ? 'translateY(-12px) scale(1.05)' : 'translateY(-8px) scale(1.02)',
                        boxShadow: isSelected
                          ? `0 24px 48px ${category.accentColor}60, 0 0 0 3px ${category.accentColor}30, inset 0 1px 0 rgba(255,255,255,0.5)`
                          : `0 16px 40px ${category.accentColor}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
                        borderColor: isSelected ? category.accentColor : 'rgba(255,255,255,0.5)',
                        '&::before': {
                          background: isSelected 
                            ? `linear-gradient(135deg, ${category.accentColor}ee 0%, ${category.accentColor}cc 100%)`
                            : `linear-gradient(135deg, ${category.accentColor}50 0%, ${category.accentColor}70 100%)`,
                        },
                        '&::after': {
                          opacity: 0.5,
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      position: 'relative',
                      zIndex: 2,
                      p: { xs: 2, md: 3 },
                    }}>
                      {/* Selection Badge */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'scaleIn 0.3s ease-out',
                            boxShadow: `0 4px 12px ${category.accentColor}60`,
                            '@keyframes scaleIn': {
                              from: { transform: 'scale(0)' },
                              to: { transform: 'scale(1)' },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: category.accentColor,
                            }}
                          />
                        </Box>
                      )}
                      
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', md: '1.3rem' },
                          color: 'white',
                          letterSpacing: '0.02em',
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          lineHeight: 1.2,
                        }}
                      >
                        {category.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Services List */}
        <Box
          ref={servicesListRef}
          id="services-list"
          sx={{
            bgcolor: 'white',
            borderRadius: '16px',
            p: { xs: 3, md: 4 },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            scrollMarginTop: '100px', // Add offset for better scrolling
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3, 
              gap: 2,
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(-10px)' : 'translateY(0)',
              transition: 'opacity 0.15s ease-in-out, transform 0.15s ease-in-out',
            }}
          >
            <Box
              sx={{
                color: currentCategory?.accentColor || '#008d80',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {currentCategory?.icon ? (
                <Box 
                  component="img" 
                  src={currentCategory.icon} 
                  alt={currentCategory.name}
                  sx={{ width: 40, height: 40, objectFit: 'contain' }}
                />
              ) : (
                getDefaultIcon(currentCategory?.name || '', currentCategory?.accentColor || '#008d80')
              )}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: '#333',
              }}
            >
              {currentCategory?.name} Services
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: { xs: 3, md: 4 },
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.15s ease-in-out, transform 0.15s ease-in-out',
            }}
          >
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                // Get the first gallery image or hero image
                const bannerImage = service.galleryImages?.[0] || service.heroImage;

                return (
                  <Card
                    key={service.id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '2px solid transparent',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${currentCategory?.accentColor || '#008d80'}30`,
                        borderColor: currentCategory?.accentColor || '#008d80',
                      },
                    }}
                  >
                    {/* Banner Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 180,
                        backgroundImage: bannerImage 
                          ? `url(${bannerImage})`
                          : `linear-gradient(135deg, #e6e7e8 0%, #f5f5f5 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                          zIndex: 1,
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      {/* Service Title - At Bottom of Banner */}
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          color: 'white',
                          lineHeight: 1.3,
                          position: 'relative',
                          zIndex: 2,
                          p: 2.5,
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        {service.name}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ pt: 3, pb: 3, px: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontSize: '0.95rem',
                          color: '#666',
                          lineHeight: 1.6,
                          mb: 2.5,
                          flexGrow: 1,
                        }}
                      >
                        {service.shortDescription}
                      </Typography>

                      {/* Available Durations */}
                      {service.sessionDurations && service.sessionDurations.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            sx={{
                              fontFamily: '"Source Sans Pro", sans-serif',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#999',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              mb: 1,
                            }}
                          >
                            Available Durations
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {service.sessionDurations.map((duration, idx) => (
                              <Chip
                                key={idx}
                                label={`${duration.duration} min`}
                                size="small"
                                sx={{
                                  bgcolor: '#008d8010',
                                  color: '#008d80',
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
                                  fontFamily: '"Source Sans Pro", sans-serif',
                                  border: '1px solid #008d8030',
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Starting Price */}
                      {service.sessionDurations && service.sessionDurations.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: '"Source Sans Pro", sans-serif',
                              fontSize: '0.85rem',
                              color: '#999',
                              fontWeight: 500,
                            }}
                          >
                            Starting from
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: '"Source Sans Pro", sans-serif',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: '#008d80',
                            }}
                          >
                            ${Math.min(...service.sessionDurations.map(d => d.price))}
                          </Typography>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box
                        sx={{
                          pt: 2,
                          borderTop: '1px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                        }}
                      >
                        {/* Learn More Link */}
                        <Link
                          href={`/services/${service.slug || service.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              color: '#008d80',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              '&:hover': {
                                gap: 1.5,
                              },
                              transition: 'gap 0.3s ease',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            >
                              Learn More
                            </Typography>
                            <Box
                              sx={{
                                fontSize: '1.2rem',
                                transition: 'transform 0.3s ease',
                              }}
                            >
                              →
                            </Box>
                          </Box>
                        </Link>

                        {/* Book Now Button */}
                        {service.bookingLink && (
                          <Box
                            component="a"
                            href={service.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              bgcolor: '#008d80',
                              color: 'white',
                              px: 3,
                              py: 1,
                              borderRadius: '8px',
                              fontFamily: '"Source Sans Pro", sans-serif',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 1,
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0,141,128,0.3)',
                              '&:hover': {
                                bgcolor: '#007067',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,141,128,0.4)',
                              },
                            }}
                          >
                            Book Now
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                <Typography 
                  sx={{ 
                    fontFamily: '"Source Sans Pro", sans-serif',
                    color: '#999', 
                    fontSize: '1.1rem',
                  }}
                >
                  No services available in this category yet.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

