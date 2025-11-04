'use client';

import { useState } from 'react';
import { Box, Container, Typography, Chip, Paper } from '@mui/material';
import { Star, Globe, X, ArrowRight } from 'phosphor-react';
import { PublicStaffMember } from '@/lib/publicStaffService';
import { ServerStaffMember } from '@/lib/serverDataService';
import Link from 'next/link';

interface StaffSectionInteractiveProps {
  initialStaff: ServerStaffMember[];
}

export default function StaffSectionInteractive({ initialStaff }: StaffSectionInteractiveProps) {
  // Convert server types to client types (they're compatible)
  const [staff] = useState<PublicStaffMember[]>(initialStaff as PublicStaffMember[]);
  const [selectedStaff, setSelectedStaff] = useState<PublicStaffMember | null>(null);

  const handleStaffClick = (member: PublicStaffMember) => {
    setSelectedStaff(member);
    // Scroll to staff details after a short delay to allow rendering
    setTimeout(() => {
      const detailsElement = document.getElementById('staff-details');
      if (detailsElement) {
        const elementPosition = detailsElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - 100; // 100px offset from top
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  if (staff.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#f8faf9', position: 'relative' }}>
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
            Meet Our Experts
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
            Click on any team member to learn more about them
          </Typography>
        </Box>

        {/* Staff Row - Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: { xs: 1.5, sm: 2, md: 3 },
            mb: 4,
          }}
        >
          {staff.map((member, index) => (
            <Paper
              key={member.id}
              onClick={() => handleStaffClick(member)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedStaff?.id === member.id ? '3px solid #008d80' : '2px solid transparent',
                borderRadius: '16px',
                overflow: 'hidden',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                '@keyframes fadeInUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0,141,128,0.3)',
                  borderColor: '#008d80',
                },
              }}
            >
              {/* Staff Member Card */}
              <Box 
                sx={{ 
                  position: 'relative',
                  height: { xs: 200, sm: 220, md: 260 },
                  backgroundImage: member.picture 
                    ? `url(${member.picture})`
                    : 'linear-gradient(135deg, #008d80 0%, #007067 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                    zIndex: 1,
                  },
                }}
              >
                {/* Content Overlay */}
                <Box sx={{ position: 'relative', zIndex: 2, p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                      color: 'white',
                      mb: 0.5,
                      lineHeight: 1.2,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {member.name}
                  </Typography>

                  {member.credentials && (
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: { xs: '0.75rem', md: '0.8rem' },
                        color: '#00d4c0',
                        fontWeight: 700,
                        mb: 0.5,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      {member.credentials}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontSize: { xs: '0.85rem', md: '0.9rem' },
                      color: 'rgba(255,255,255,0.95)',
                      fontWeight: 500,
                      lineHeight: 1.3,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {member.title}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Selected Staff Detail View */}
        {selectedStaff && (
          <Paper
            id="staff-details"
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              animation: 'fadeIn 0.4s ease-out',
              '@keyframes fadeIn': {
                from: {
                  opacity: 0,
                  transform: 'scale(0.95)',
                },
                to: {
                  opacity: 1,
                  transform: 'scale(1)',
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                bgcolor: 'white',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <Box
                onClick={() => setSelectedStaff(null)}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'rotate(90deg)',
                  },
                }}
              >
                <X size={24} weight="bold" color="#333" />
              </Box>

              {/* Left Side - Large Image */}
              <Box
                sx={{
                  width: { xs: '100%', md: '40%' },
                  minHeight: { xs: 300, md: 400 },
                  background: selectedStaff.picture
                    ? `url(${selectedStaff.picture})`
                    : 'linear-gradient(135deg, #008d80 0%, #007067 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!selectedStaff.picture && (
                  <Typography
                    sx={{
                      fontSize: '8rem',
                      fontWeight: 700,
                      color: 'white',
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    {selectedStaff.name.charAt(0).toUpperCase()}
                  </Typography>
                )}
              </Box>

              {/* Right Side - Details */}
              <Box
                sx={{
                  width: { xs: '100%', md: '60%' },
                  p: { xs: 4, md: 6 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 700,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    color: '#008d80',
                    mb: 1,
                  }}
                >
                  {selectedStaff.name}
                </Typography>

                {selectedStaff.credentials && (
                  <Typography
                    sx={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontSize: '1rem',
                      color: '#008d80',
                      fontWeight: 700,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {selectedStaff.credentials}
                  </Typography>
                )}

                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1.2rem',
                    color: '#666',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  {selectedStaff.title}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1rem',
                    color: '#666',
                    lineHeight: 1.8,
                    mb: 3,
                  }}
                >
                  {selectedStaff.shortBio || selectedStaff.shortDescription}
                </Typography>

                {/* Info Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  {selectedStaff.yearsOfExperience && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star size={20} weight="fill" color="#008d80" />
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontSize: '0.95rem',
                          color: '#666',
                          fontWeight: 600,
                        }}
                      >
                        {selectedStaff.yearsOfExperience} years experience
                      </Typography>
                    </Box>
                  )}

                  {selectedStaff.spokenLanguages && selectedStaff.spokenLanguages.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Globe size={20} weight="fill" color="#008d80" />
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontSize: '0.95rem',
                          color: '#666',
                          fontWeight: 600,
                        }}
                      >
                        {selectedStaff.spokenLanguages.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Specializations */}
                {selectedStaff.areasOfSpecialization && selectedStaff.areasOfSpecialization.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#999',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        mb: 1.5,
                      }}
                    >
                      Areas of Specialization
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedStaff.areasOfSpecialization.map((spec, idx) => (
                        <Chip
                          key={idx}
                          label={spec}
                          sx={{
                            bgcolor: '#008d8015',
                            color: '#008d80',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            fontFamily: '"Source Sans Pro", sans-serif',
                            border: '1px solid #008d8030',
                            py: 2.5,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Read More Link */}
                <Link
                  href={`/staff/${selectedStaff.slug || selectedStaff.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 4,
                      py: 2,
                      borderRadius: '50px',
                      bgcolor: '#008d80',
                      color: 'white',
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(0,141,128,0.3)',
                      '&:hover': {
                        bgcolor: '#007067',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,141,128,0.4)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'white',
                      }}
                    >
                      Read more about {selectedStaff.name}
                    </Typography>
                    <ArrowRight size={20} weight="bold" color="white" />
                  </Box>
                </Link>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

