import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import Script from 'next/script';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import StaffSectionInteractive from '@/components/website/StaffSectionInteractive';
import Link from 'next/link';
import { Calendar } from 'phosphor-react';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import { generateBreadcrumbSchema } from '@/lib/seo/utils';
import { SITE_CONFIG } from '@/lib/seo/config';

export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'About Us - Gardenias Healthcare Clinic',
    description: 'Learn about Gardenias Healthcare Clinic in Milton, Ontario. Our mission is to help you achieve lasting wellness through personalized care, evidence-based therapies, and genuine human connection.',
    keywords: ['about Gardenias Healthcare', 'healthcare clinic Milton', 'Milton healthcare', 'medical clinic Milton Ontario'],
    url: 'https://www.gardenias-healthcare.net/about',
  });
}

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_CONFIG.baseUrl}/` },
    { name: 'About Us', url: `${SITE_CONFIG.baseUrl}/about` },
  ]);

  return (
    <>
      {/* Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <Box>
        {/* Hero Section */}
      <AboutHeroSection
        title="Healing Begins with Understanding"
        subtitle="At Gardenias Healthcare Clinic, we believe healing is not just about treatment — it&apos;s about understanding the whole person. Our mission is to help you achieve lasting wellness through personalized care, evidence-based therapies, and genuine human connection."
        heroImage="/images/About%20us.png"
      />

      {/* Our Story Section - Image on Right */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 6 }, alignItems: 'center' }}>
            {/* Text Column - Left */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#008d80',
                  mb: 4,
                }}
              >
                Our Story
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                Founded with the vision of making high-quality healthcare both personal and accessible, Gardenias Healthcare Clinic brings together a team of experienced practitioners dedicated to improving your physical and emotional well-being.
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                }}
              >
                From pain management to preventive care, we combine the science of modern healthcare with the art of compassionate treatment. Every session, every recommendation, and every conversation is designed to help you feel heard, supported, and empowered to take control of your health.
              </Typography>
            </Box>
            
            {/* Image Column - Right */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  component="img"
                  src="/images/A001.png"
                  alt="Our Story"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Our Approach Section - Image on Left */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#f8faf9' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 6 }, alignItems: 'center' }}>
            {/* Image Column - Left */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  component="img"
                  src="/images/A001.png"
                  alt="Our Approach"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
            
            {/* Text Column - Right */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#008d80',
                  mb: 4,
                }}
              >
                Our Approach
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                We see health as a partnership. At Gardenias, your journey begins with listening — understanding your needs, lifestyle, and goals before recommending any treatment.
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                }}
              >
                Our team collaborates across multiple disciplines — including Massage Therapy, Reflexology, Psychotherapy, Naturopathic Medicine, and Osteopathy — ensuring every plan is complete, coordinated, and focused on your long-term recovery.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Our Philosophy Section - Image on Right */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 6 }, alignItems: 'center' }}>
            {/* Text Column - Left */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#008d80',
                  mb: 4,
                }}
              >
                Our Philosophy
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                Healing at Gardenias is more than symptom relief.
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                We address the root cause of discomfort, restore balance to body and mind, and help you build sustainable habits that support lifelong wellness.
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                }}
              >
                Whether your goal is to move with ease, feel emotionally stronger, or simply live with more energy — we&apos;re here to guide you every step of the way.
              </Typography>
            </Box>
            
            {/* Image Column - Right */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  component="img"
                  src="/images/A003.png"
                  alt="Our Philosophy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Our Team Intro Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#f8faf9' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 6 }, alignItems: 'center' }}>
            {/* Image Column - Left */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  component="img"
                  src="/images/A002.png"
                  alt="Our Team"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
            
            {/* Text Column - Right */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#008d80',
                  mb: 4,
                }}
              >
                Our Team
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#666',
                  lineHeight: 1.8,
                }}
              >
                Our practitioners are licensed, experienced, and deeply passionate about what they do. Each brings unique expertise — from manual therapy and acupuncture to emotional and nutritional health — united by one goal: helping you heal safely and naturally.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Our Team Section - Staff Grid */}
      <StaffSectionInteractive />

      {/* Why Choose Gardenias Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: '#008d80',
              mb: 6,
              textAlign: 'center',
            }}
          >
            Why Choose Gardenias Healthcare
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4,
            }}
          >
            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '2px solid #008d8020',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#008d80',
                  boxShadow: '0 12px 32px rgba(0,141,128,0.2)',
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#008d80',
                    mb: 2,
                  }}
                >
                  Integrated Care
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: 1.7,
                  }}
                >
                  Collaborative, multidisciplinary approach for faster, lasting results.
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '2px solid #008d8020',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#008d80',
                  boxShadow: '0 12px 32px rgba(0,141,128,0.2)',
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#008d80',
                    mb: 2,
                  }}
                >
                  Personalized Treatment
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: 1.7,
                  }}
                >
                  Every plan is customized to your unique goals and health history.
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '2px solid #008d8020',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#008d80',
                  boxShadow: '0 12px 32px rgba(0,141,128,0.2)',
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#008d80',
                    mb: 2,
                  }}
                >
                  Evidence-Based Practice
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: 1.7,
                  }}
                >
                  Safe, professional therapies supported by clinical experience.
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '2px solid #008d8020',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#008d80',
                  boxShadow: '0 12px 32px rgba(0,141,128,0.2)',
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#008d80',
                    mb: 2,
                  }}
                >
                  Compassionate Environment
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: 1.7,
                  }}
                >
                  Modern, calming clinic designed for your comfort and trust.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          bgcolor: '#008d80',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: 'white',
                mb: 3,
              }}
            >
              Your Wellness Journey Starts Here
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 1.8,
                maxWidth: '800px',
                mx: 'auto',
                mb: 5,
              }}
            >
              Better health begins with a single step — and we&apos;re here to walk that journey with you.
              Whether you&apos;re managing pain, recovering from an injury, or focusing on preventive care, our team is ready to help.
            </Typography>
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              size="large"
              startIcon={<Calendar size={24} weight="fill" />}
              sx={{
                bgcolor: 'white',
                color: '#008d80',
                px: 5,
                py: 2,
                borderRadius: '50px',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontWeight: 700,
                fontSize: '1.2rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                },
              }}
            >
              Book Your Appointment
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
    </>
  );
}
