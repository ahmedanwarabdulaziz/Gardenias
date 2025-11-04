'use client';

import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { List as MenuIcon, Phone, CaretDown } from 'phosphor-react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicCategory, PublicService } from '@/lib/publicCategoryService';
import { PublicStaffMember } from '@/lib/publicStaffService';
import { ServerCategory, ServerService, ServerStaffMember } from '@/lib/serverDataService';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services', hasDropdown: true, type: 'services' },
  { label: 'Staff', href: '/staff', hasDropdown: true, type: 'staff' },
  { label: 'Contact', href: '/contact' },
];

interface WebsiteHeaderProps {
  initialCategories: ServerCategory[];
  initialServices: ServerService[];
  initialStaff: ServerStaffMember[];
}

export default function WebsiteHeader({ initialCategories, initialServices, initialStaff }: WebsiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileStaffOpen, setMobileStaffOpen] = useState(false);
  
  // Convert server types to client types (they're compatible)
  const categories = initialCategories as PublicCategory[];
  const services = initialServices as PublicService[];
  const staff = initialStaff as PublicStaffMember[];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Box sx={{ mb: 1, px: 1, display: 'flex', justifyContent: 'center' }} onClick={handleDrawerToggle}>
        <Image
          src="/images/logo.png"
          alt="Gardenias Healthcare Clinic"
          width={320}
          height={110}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <List>
        {navigationItems.map((item) => (
          <Box key={item.label}>
            <ListItem disablePadding>
              {item.hasDropdown ? (
                <ListItemButton 
                  onClick={() => {
                    if (item.type === 'services') {
                      setMobileServicesOpen(!mobileServicesOpen);
                    } else if (item.type === 'staff') {
                      setMobileStaffOpen(!mobileStaffOpen);
                    }
                  }}
                  sx={{ 
                    py: 1.5,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 141, 128, 0.08)' 
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 500,
                      color: '#008d80',
                    }}
                  />
                  <CaretDown 
                    size={16} 
                    weight="bold" 
                    style={{ 
                      transform: (item.type === 'services' && mobileServicesOpen) || (item.type === 'staff' && mobileStaffOpen) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }} 
                  />
                </ListItemButton>
              ) : (
                <ListItemButton 
                  component={Link} 
                  href={item.href}
                  onClick={handleDrawerToggle}
                  sx={{ 
                    py: 1.5,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 141, 128, 0.08)' 
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 500,
                      color: '#008d80',
                    }}
                  />
                </ListItemButton>
              )}
            </ListItem>
            
            {/* Services Submenu */}
            {item.hasDropdown && item.type === 'services' && mobileServicesOpen && (
              <Box sx={{ bgcolor: '#f5f5f5', pl: 2 }}>
                {categories.map((category) => {
                  const categoryServices = services.filter(s => s.categoryId === category.id);
                  return categoryServices.length > 0 ? (
                    <Box key={category.id} sx={{ py: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#333',
                          px: 2,
                          py: 0.5,
                        }}
                      >
                        {category.name}
                      </Typography>
                      {categoryServices.map((service) => (
                        <ListItemButton
                          key={service.id}
                          component={Link}
                          href={`/services/${service.slug || service.id}`}
                          onClick={handleDrawerToggle}
                          sx={{
                            py: 1,
                            pl: 3,
                            '&:hover': {
                              bgcolor: 'rgba(0, 141, 128, 0.08)',
                            },
                          }}
                        >
                          <ListItemText
                            primary={service.name}
                            primaryTypographyProps={{
                              fontFamily: '"Source Sans Pro", sans-serif',
                              fontSize: '0.9rem',
                              fontWeight: 400,
                              color: '#666',
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </Box>
                  ) : null;
                })}
              </Box>
            )}

            {/* Staff Submenu */}
            {item.hasDropdown && item.type === 'staff' && mobileStaffOpen && (
              <Box sx={{ bgcolor: '#f5f5f5', pl: 2 }}>
                {staff.map((member) => (
                  <ListItemButton
                    key={member.id}
                    component={Link}
                    href={`/staff/${member.slug || member.id}`}
                    onClick={handleDrawerToggle}
                    sx={{
                      py: 1.5,
                      pl: 3,
                      '&:hover': {
                        bgcolor: 'rgba(0, 141, 128, 0.08)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={member.name}
                      secondary={member.title}
                      primaryTypographyProps={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#333',
                      }}
                      secondaryTypographyProps={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.8rem',
                        color: '#666',
                      }}
                    />
                  </ListItemButton>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Toolbar 
            sx={{ 
              px: 0,
              py: { xs: 0, md: 0.5 }, 
              minHeight: { xs: 56, md: 64 },
              justifyContent: { xs: 'center', md: 'space-between' },
              position: 'relative'
            }}
          >
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                position: { xs: 'absolute', md: 'static' },
                left: { xs: 0, md: 'auto' },
                display: { md: 'none' },
                color: '#008d80' // Green brand color
              }}
            >
              <MenuIcon size={24} weight="bold" />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'visible' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Box sx={{ 
                  width: { xs: 280, sm: 380, md: 480 }, 
                  height: { xs: 70, sm: 95, md: 120 },
                  position: 'relative',
                  my: -1,
                  '& img': {
                    objectPosition: 'center !important',
                    '@media (min-width: 900px)': {
                      objectPosition: 'left center !important'
                    }
                  }
                }}>
                  <Image
                    src="/images/logo.png"
                    alt="Gardenias Healthcare Clinic"
                    fill
                    priority
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Link>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 0.5, lg: 1 }, alignItems: 'center' }}>
              {navigationItems.map((item) => (
                <Box
                  key={item.label}
                  onMouseEnter={() => {
                    if (item.hasDropdown) {
                      if (item.type === 'services') {
                        setServicesMenuOpen(true);
                      } else if (item.type === 'staff') {
                        setStaffMenuOpen(true);
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (item.hasDropdown) {
                      // Check if mouse is moving to the dropdown menu
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      if (relatedTarget && relatedTarget.closest('[data-dropdown-menu]')) {
                        return; // Don't close if moving to dropdown
                      }
                      
                      // Add a small delay to allow moving to dropdown
                      setTimeout(() => {
                        if (item.type === 'services') {
                          setServicesMenuOpen(false);
                        } else if (item.type === 'staff') {
                          setStaffMenuOpen(false);
                        }
                      }, 150);
                    }
                  }}
                  sx={{ position: 'relative' }}
                >
                  <Button
                    component={Link}
                    href={item.href}
                    endIcon={item.hasDropdown ? <CaretDown size={16} weight="bold" /> : null}
                    sx={{ 
                      color: '#008d80',
                      textTransform: 'none',
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 600,
                      fontSize: { md: '0.95rem', lg: '1rem' },
                      px: { md: 1.5, lg: 2 },
                      py: 1,
                      minWidth: 'auto',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        bgcolor: 'rgba(0, 141, 128, 0.08)',
                        color: '#006b5f'
                      }
                    }}
                  >
                    {item.label}
                  </Button>

                  {/* Services Mega Menu Dropdown */}
                  {item.hasDropdown && item.type === 'services' && servicesMenuOpen && categories.length > 0 && (
                    <Paper
                      data-dropdown-menu="true"
                      onMouseEnter={() => setServicesMenuOpen(true)}
                      onMouseLeave={() => setServicesMenuOpen(false)}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        mt: 0.5,
                        width: '800px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        border: '2px solid #008d8020',
                        zIndex: 1300,
                        animation: 'slideDown 0.3s ease-out',
                        '@keyframes slideDown': {
                          from: {
                            opacity: 0,
                            transform: 'translateX(-50%) translateY(-10px)',
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateX(-50%) translateY(0)',
                          },
                        },
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        {/* Header */}
                        <Typography
                          sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#008d80',
                            mb: 3,
                          }}
                        >
                          Our Services
                        </Typography>

                        {/* Categories Columns */}
                        <Box
                          sx={{
                            columnCount: 2,
                            columnGap: 4,
                          }}
                        >
                          {categories.map((category) => {
                            const categoryServices = services.filter(s => s.categoryId === category.id);
                            
                            return (
                              <Box 
                                key={category.id}
                                sx={{
                                  breakInside: 'avoid',
                                  mb: 2,
                                }}
                              >
                                {/* Category Header */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 1.5,
                                    pb: 1,
                                    borderBottom: `2px solid ${category.accentColor}30`,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: category.accentColor,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontFamily: '"Source Sans Pro", sans-serif',
                                      fontSize: '1rem',
                                      fontWeight: 700,
                                      color: '#333',
                                    }}
                                  >
                                    {category.name}
                                  </Typography>
                                </Box>

                                {/* Services List */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                  {categoryServices.length > 0 ? (
                                    categoryServices.map((service) => (
                                      <Link
                                        key={service.id}
                                        href={`/services/${service.slug || service.id}`}
                                        style={{ textDecoration: 'none' }}
                                      >
                                        <Box
                                          sx={{
                                            px: 2,
                                            py: 1,
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                              bgcolor: `${category.accentColor}10`,
                                              transform: 'translateX(4px)',
                                            },
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              fontFamily: '"Source Sans Pro", sans-serif',
                                              fontSize: '0.95rem',
                                              fontWeight: 500,
                                              color: '#666',
                                              '&:hover': {
                                                color: category.accentColor,
                                              },
                                            }}
                                          >
                                            {service.name}
                                          </Typography>
                                        </Box>
                                      </Link>
                                    ))
                                  ) : (
                                    <Typography
                                      sx={{
                                        fontFamily: '"Source Sans Pro", sans-serif',
                                        fontSize: '0.85rem',
                                        color: '#999',
                                        fontStyle: 'italic',
                                        px: 2,
                                      }}
                                    >
                                      No services available
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>

                        {/* View All Services Link */}
                        <Divider sx={{ my: 3 }} />
                        <Link href="/services" style={{ textDecoration: 'none' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                              py: 2,
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: '#008d8010',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#008d80',
                              }}
                            >
                              View All Services
                            </Typography>
                            <Box sx={{ fontSize: '1.2rem', color: '#008d80' }}>→</Box>
                          </Box>
                        </Link>
                      </Box>
                    </Paper>
                  )}

                  {/* Staff Dropdown Menu */}
                  {item.hasDropdown && item.type === 'staff' && staffMenuOpen && staff.length > 0 && (
                    <Paper
                      data-dropdown-menu="true"
                      onMouseEnter={() => setStaffMenuOpen(true)}
                      onMouseLeave={() => setStaffMenuOpen(false)}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        mt: 0.5,
                        width: '400px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        border: '2px solid #008d8020',
                        zIndex: 1300,
                        animation: 'slideDown 0.3s ease-out',
                        '@keyframes slideDown': {
                          from: {
                            opacity: 0,
                            transform: 'translateX(-50%) translateY(-10px)',
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateX(-50%) translateY(0)',
                          },
                        },
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        {/* Header */}
                        <Typography
                          sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#008d80',
                            mb: 3,
                          }}
                        >
                          Meet Our Team
                        </Typography>

                        {/* Staff List */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                          {staff.map((member) => (
                            <Link
                              key={member.id}
                              href={`/staff/${member.slug || member.id}`}
                              style={{ textDecoration: 'none' }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  px: 2,
                                  py: 2,
                                  borderRadius: '12px',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: '#008d8010',
                                    transform: 'translateX(4px)',
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    bgcolor: '#008d80',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: '"Source Sans Pro", sans-serif',
                                    fontWeight: 700,
                                    fontSize: '1.2rem',
                                    flexShrink: 0,
                                    backgroundImage: member.picture ? `url(${member.picture})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                >
                                  {!member.picture && member.name.charAt(0).toUpperCase()}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontFamily: '"Source Sans Pro", sans-serif',
                                      fontSize: '1rem',
                                      fontWeight: 600,
                                      color: '#333',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {member.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontFamily: '"Source Sans Pro", sans-serif',
                                      fontSize: '0.85rem',
                                      color: '#666',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {member.title}
                                  </Typography>
                                </Box>
                              </Box>
                            </Link>
                          ))}
                        </Box>

                        {/* View All Staff Link */}
                        <Divider sx={{ my: 3 }} />
                        <Link href="/staff" style={{ textDecoration: 'none' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                              py: 2,
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: '#008d8010',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#008d80',
                              }}
                            >
                              View All Staff
                            </Typography>
                            <Box sx={{ fontSize: '1.2rem', color: '#008d80' }}>→</Box>
                          </Box>
                        </Link>
                      </Box>
                    </Paper>
                  )}
                </Box>
              ))}
              
              <Button
                component={Link}
                href="/contact"
                startIcon={<Phone size={18} weight="bold" />}
                sx={{ 
                  ml: { md: 1, lg: 2 },
                  bgcolor: '#008d80', // Green (primary)
                  color: 'white',
                  textTransform: 'none',
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontWeight: 600,
                  fontSize: { md: '0.95rem', lg: '1rem' },
                  px: { md: 2, lg: 3 },
                  py: 1,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: '#006b5f',
                  }
                }}
              >
                Book Appointment
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}