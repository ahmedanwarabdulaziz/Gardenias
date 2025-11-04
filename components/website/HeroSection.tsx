'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { Phone, ArrowRight } from 'phosphor-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '500px', md: '600px', lg: '700px' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/images/g001.png"
          alt="Gardenias Healthcare Clinic"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          quality={90}
        />
        {/* Overlay for better text readability */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      </Box>

      {/* Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          py: { xs: 6, md: 8 }
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: '100%', md: '700px', lg: '800px' },
            textAlign: { xs: 'center', md: 'left' },
            mx: { xs: 'auto', md: 0 }
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
              lineHeight: 1.1,
              color: 'white',
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Give Your Body
            <br />
            What It Deserves
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
              lineHeight: 1.7,
              color: 'white',
              mb: 4,
              maxWidth: { xs: '100%', md: '650px' },
              mx: { xs: 'auto', md: 0 },
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            At Gardenias Healthcare Clinic, we combine evidence-based therapies with 
            compassionate care to help you move, heal, and feel your best. Our team of 
            licensed professionals works together to restore balance, reduce pain, and 
            support your body&apos;s natural ability to recover — one treatment at a time.
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}
          >
            <Button
              component={Link}
              href="/contact"
              startIcon={<Phone size={20} weight="bold" />}
              sx={{
                bgcolor: '#008d80', // Green (primary)
                color: 'white',
                textTransform: 'none',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                px: { xs: 3, sm: 4 },
                py: 1.5,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(0, 141, 128, 0.4)',
                '&:hover': {
                  bgcolor: '#006b5f',
                  boxShadow: '0 6px 20px rgba(0, 141, 128, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Book Your Appointment
            </Button>

            <Button
              component={Link}
              href="/services"
              endIcon={<ArrowRight size={20} weight="bold" />}
              sx={{
                bgcolor: 'white', // White (secondary)
                color: '#008d80', // Green brand text
                textTransform: 'none',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                px: { xs: 3, sm: 4 },
                py: 1.5,
                borderRadius: '8px',
                border: '2px solid white',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: '#006b5f', // Darker green on hover
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 255, 255, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Our Services
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

