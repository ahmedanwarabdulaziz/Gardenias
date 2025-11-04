'use client';

import { usePathname } from 'next/navigation';
import { Box, Container, Typography, Card } from '@mui/material';
import WebsiteHeaderWrapper from '@/components/website/WebsiteHeaderWrapper';
import WebsiteFooter from '@/components/website/WebsiteFooter';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import { ServerCategory, ServerService, ServerStaffMember } from '@/lib/serverDataService';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  initialCategories: ServerCategory[];
  initialServices: ServerService[];
  initialStaff: ServerStaffMember[];
}

export default function ConditionalLayout({ 
  children,
  initialCategories,
  initialServices,
  initialStaff,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if admin route or contact page (to avoid duplication)
  const isAdminRoute = pathname?.startsWith('/admin');
  const isContactPage = pathname === '/contact';
  
  if (isAdminRoute) {
    return <main>{children}</main>;
  }
  
  return (
    <>
      <WebsiteHeaderWrapper 
        initialCategories={initialCategories}
        initialServices={initialServices}
        initialStaff={initialStaff}
      />
      <main>{children}</main>
      
      {/* Contact Section - Show on all pages except contact page */}
      {!isContactPage && (
        <>
          {/* Contact Information & Form Section */}
          <Box 
            sx={{ 
              py: { xs: 6, md: 10 }, 
              bgcolor: '#f8faf9',
              width: '100%',
            }}
          >
            <Container maxWidth="lg">
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#008d80',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1.1rem', md: '1.2rem' },
                  color: '#666',
                  mb: 6,
                  textAlign: 'center',
                  maxWidth: '700px',
                  mx: 'auto',
                }}
              >
                Have questions or ready to book an appointment? We&apos;re here to help you on your wellness journey.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 4, md: 6 },
                }}
              >
                {/* Contact Form - Left Column */}
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Card
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      height: '100%',
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        color: '#008d80',
                        mb: 2,
                      }}
                    >
                      Contact Form
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '1.1rem',
                        color: '#666',
                        mb: 4,
                        fontWeight: 500,
                      }}
                    >
                      Make communication effortless.
                    </Typography>
                    <ContactForm />
                  </Card>
                </Box>

                {/* Contact Information - Right Column */}
                <Box sx={{ flex: 1, width: '100%' }}>
                  <ContactInfo />
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Map Section */}
          <Box 
            sx={{ 
              py: { xs: 6, md: 10 }, 
              bgcolor: 'white',
              width: '100%',
            }}
          >
            <Container maxWidth="lg">
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: '#008d80',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Visit Our Clinic
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  color: '#666',
                  mb: 5,
                  textAlign: 'center',
                }}
              >
                348 Bronte St South, Unit #12, Milton, ON L9T 5B6
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '400px', md: '500px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '2px solid #008d8020',
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2896.942838377247!2d-79.88464!3d43.51726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b6a1f1d1c1c1f%3A0x1234567890abcdef!2s348%20Bronte%20St%20S%2C%20Milton%2C%20ON%20L9T%205B6!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Gardenias Healthcare Clinic Location"
                />
              </Box>
              
              {/* Directions Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Box
                  component="a"
                  href="https://www.google.com/maps/dir/?api=1&destination=348+Bronte+St+South+Unit+12+Milton+ON+L9T+5B6"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: '#008d80',
                    color: 'white',
                    px: 4,
                    py: 2,
                    borderRadius: '50px',
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(0,141,128,0.4)',
                    '&:hover': {
                      bgcolor: '#007067',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,141,128,0.5)',
                    },
                  }}
                >
                  Get Directions
                  <Box component="span" sx={{ fontSize: '1.3rem' }}>→</Box>
                </Box>
              </Box>
            </Container>
          </Box>
        </>
      )}
      
      <WebsiteFooter />
    </>
  );
}
