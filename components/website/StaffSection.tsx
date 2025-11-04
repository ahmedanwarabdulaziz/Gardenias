'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Chip, CircularProgress } from '@mui/material';
import { Users, Star, Globe } from 'phosphor-react';
import { PublicStaffService, PublicStaffMember } from '@/lib/publicStaffService';

export default function StaffSection() {
  const [staff, setStaff] = useState<PublicStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const staffData = await PublicStaffService.getPublicStaff();
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#008d80' }} />
      </Box>
    );
  }

  if (staff.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2,
              px: 3,
              py: 1,
              borderRadius: '50px',
              bgcolor: '#008d8010',
              border: '1px solid #008d8030',
            }}
          >
            <Users size={24} weight="duotone" color="#008d80" />
            <Typography
              sx={{
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#008d80',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Our Team
            </Typography>
          </Box>
          
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
            Our dedicated team of healthcare professionals is committed to providing you with exceptional care
          </Typography>
        </Box>

        {/* Staff Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: { xs: 3, md: 4 },
          }}
        >
          {staff.map((member, index) => (
            <Card
              key={member.id}
              component="a"
              href={`/staff/${member.slug}`}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid transparent',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                textDecoration: 'none',
                cursor: 'pointer',
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
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,141,128,0.2)',
                  borderColor: '#008d80',
                },
              }}
            >
              {/* Profile Image */}
              <Box
                sx={{
                  position: 'relative',
                  pt: 4,
                  pb: 2,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
                }}
              >
                <Avatar
                  src={member.picture}
                  alt={member.name}
                  sx={{
                    width: 140,
                    height: 140,
                    mx: 'auto',
                    border: '4px solid white',
                    boxShadow: '0 8px 24px rgba(0,141,128,0.2)',
                    bgcolor: '#008d80',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {!member.picture && member.name.charAt(0).toUpperCase()}
                </Avatar>
              </Box>

              {/* Content */}
              <CardContent sx={{ pt: 2, pb: 3, px: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Name & Title */}
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    color: '#333',
                    mb: 0.5,
                    textAlign: 'center',
                  }}
                >
                  {member.name}
                </Typography>

                {member.credentials && (
                  <Typography
                    sx={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontSize: '0.85rem',
                      color: '#008d80',
                      fontWeight: 600,
                      mb: 1,
                      textAlign: 'center',
                    }}
                  >
                    {member.credentials}
                  </Typography>
                )}

                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1rem',
                    color: '#666',
                    fontWeight: 600,
                    mb: 2,
                    textAlign: 'center',
                  }}
                >
                  {member.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '0.95rem',
                    color: '#666',
                    lineHeight: 1.6,
                    mb: 2,
                    flexGrow: 1,
                    textAlign: 'center',
                  }}
                >
                  {member.shortBio || member.shortDescription}
                </Typography>

                {/* Info Tags */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  {/* Years of Experience */}
                  {member.yearsOfExperience && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                      <Star size={18} weight="duotone" color="#008d80" />
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontSize: '0.85rem',
                          color: '#666',
                        }}
                      >
                        {member.yearsOfExperience} experience
                      </Typography>
                    </Box>
                  )}

                  {/* Languages */}
                  {member.spokenLanguages && member.spokenLanguages.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                      <Globe size={18} weight="duotone" color="#008d80" />
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontSize: '0.85rem',
                          color: '#666',
                        }}
                      >
                        {member.spokenLanguages.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Specializations */}
                {member.areasOfSpecialization && member.areasOfSpecialization.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#999',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 1,
                        textAlign: 'center',
                      }}
                    >
                      Specializations
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                      {member.areasOfSpecialization.slice(0, 3).map((spec, idx) => (
                        <Chip
                          key={idx}
                          label={spec}
                          size="small"
                          sx={{
                            bgcolor: '#008d8010',
                            color: '#008d80',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            fontFamily: '"Source Sans Pro", sans-serif',
                            border: '1px solid #008d8030',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

