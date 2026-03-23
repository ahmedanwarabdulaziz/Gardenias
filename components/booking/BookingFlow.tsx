'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Avatar,
  Fade,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Spa,
  Person,
  CalendarMonth,
  PersonOutline,
  CheckCircle,
  AccessTime,
  ArrowForward,
  ArrowBack,
  Close,
  ExpandMore,
  ExpandLess,
  AutoAwesome,
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceVariation {
  variationId: string;
  variationName: string;
  version: string;
  durationMinutes: number | null;
  priceCents: number | null;
  currency: string;
}

interface BookingService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  squareItemId: string;
  variations: ServiceVariation[];
  displayOrder: number;
}

interface ServiceCategory {
  categoryId: string;
  categoryName: string;
  services: BookingService[];
}

interface StaffMember {
  id: string;
  displayName: string;
  jobTitle: string;
}

interface SquareStaffMember {
  id: string;
  displayName: string;
  jobTitle: string;
  profileImageUrl: string | null;
  isBookable: boolean;
}

interface Availability {
  startAt: string;
  locationId: string;
  appointmentSegments: Array<{
    durationMinutes: number;
    teamMemberId: string;
    serviceVariationId: string;
    serviceVariationVersion: string;
  }>;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string;
}

interface FirebaseStaffMember {
  squareTeamMemberId?: string;
  name?: string;
  title?: string;
  picture?: string;
}

type BookingPath = 'service' | 'practitioner' | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(cents: number | null, currency: string): string {
  if (cents === null) return 'Contact for pricing';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency || 'CAD',
  }).format(cents / 100);
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
}

function formatSlotTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateDisplay(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Step labels per path ────────────────────────────────────────────────────

const pathASteps = [
  { label: 'How to Book', icon: <AutoAwesome /> },
  { label: 'Select Service', icon: <Spa /> },
  { label: 'Choose Practitioner', icon: <Person /> },
  { label: 'Pick Date & Time', icon: <CalendarMonth /> },
  { label: 'Your Details', icon: <PersonOutline /> },
  { label: 'Confirmation', icon: <CheckCircle /> },
];

const pathBSteps = [
  { label: 'How to Book', icon: <AutoAwesome /> },
  { label: 'Choose Practitioner', icon: <Person /> },
  { label: 'Select Service', icon: <Spa /> },
  { label: 'Pick Date & Time', icon: <CalendarMonth /> },
  { label: 'Your Details', icon: <PersonOutline /> },
  { label: 'Confirmation', icon: <CheckCircle /> },
];

// ─── Shared Styles ───────────────────────────────────────────────────────────

const cardStyle = {
  p: { xs: 3, md: 5 },
  borderRadius: '20px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,141,128,0.08)',
  minHeight: 300,
};

const stepTitle = {
  fontFamily: '"Playfair Display", serif',
  fontWeight: 700,
  fontSize: { xs: '1.5rem', md: '1.8rem' },
  color: '#333',
  mb: 1,
};

const stepSubtitle = {
  fontFamily: '"Source Sans Pro", sans-serif',
  fontSize: '1rem',
  color: '#666',
  mb: 4,
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: '"Source Sans Pro", sans-serif',
    '&.Mui-focused fieldset': { borderColor: '#008d80' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#008d80' },
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

export default function BookingFlow() {
  const searchParams = useSearchParams();

  // ─── Core State ──────────────────────────────────────────────────────────
  const [bookingPath, setBookingPath] = useState<BookingPath>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Data ────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [serviceStaff, setServiceStaff] = useState<StaffMember[]>([]);
  const [squareStaff, setSquareStaff] = useState<SquareStaffMember[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  // ─── Selections ──────────────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ServiceVariation | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<SquareStaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
  });

  // ─── UI State ────────────────────────────────────────────────────────────
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<Record<string, unknown> | null>(null);
  // Calendar state: track which month is displayed and which dates have slots
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [dateAvailability, setDateAvailability] = useState<Record<string, 'available' | 'unavailable' | 'loading'>>({});
  const [loadingDates, setLoadingDates] = useState(false);
  // Tracks days where selected staff is full BUT another practitioner is free
  const [dateAnyStaffAvail, setDateAnyStaffAvail] = useState<Record<string, boolean>>({});
  // Calendar state: the Monday that starts the currently-displayed week
  const [calendarWeekStart, setCalendarWeekStart] = useState<Date>(() => {
    const d = new Date();
    // Go back to Monday (or stay on Monday)
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // ─── Pre-selection from URL param ────────────────────────────────────────
  useEffect(() => {
    const serviceSlug = searchParams.get('service');
    if (serviceSlug) {
      // Pre-selection: fetch services immediately and skip to Step 1
      fetchBookingServices(serviceSlug);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger week availability pre-check when entering Step 3 or when week changes
  useEffect(() => {
    if (activeStep === 3 && selectedVariation) {
      fetchWeekAvailability(calendarWeekStart);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, calendarWeekStart, selectedVariation, selectedStaff]);

  // Fetch services — called only when user selects a path or via pre-selection
  const fetchBookingServices = async (preSelectSlug?: string) => {
    if (categories.length > 0) {
      // Already loaded, just handle pre-selection
      if (preSelectSlug) applyPreSelection(preSelectSlug);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/booking/services');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const cats = data.categories || [];
      setCategories(cats);

      if (preSelectSlug) {
        // Find and pre-select the service
        for (const cat of cats) {
          const svc = cat.services.find((s: BookingService) => s.slug === preSelectSlug);
          if (svc) {
            setBookingPath('service');
            setSelectedService(svc);
            if (svc.variations.length === 1) setSelectedVariation(svc.variations[0]);
            setExpandedCategory(cat.categoryId);
            setActiveStep(1);
            break;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const applyPreSelection = (slug: string) => {
    for (const cat of categories) {
      const svc = cat.services.find(s => s.slug === slug);
      if (svc) {
        setBookingPath('service');
        setSelectedService(svc);
        if (svc.variations.length === 1) setSelectedVariation(svc.variations[0]);
        setExpandedCategory(cat.categoryId);
        setActiveStep(1);
        break;
      }
    }
  };

  // Fetch locationId — deferred until actually needed (date/time step)
  const fetchLocationId = async (): Promise<string | null> => {
    if (locationId) return locationId;
    try {
      const res = await fetch('/api/square/services');
      const data = await res.json();
      const loc = data.locationId || null;
      setLocationId(loc);
      return loc;
    } catch {
      return null;
    }
  };

  // Fetch staff assigned to a specific service variation
  const fetchServiceStaff = useCallback(async (squareItemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/square/service-staff?itemId=${squareItemId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setServiceStaff(data.staff || []);

      // Fetch CMS staff from Firebase (for picture enrichment when squareTeamMemberId is linked)
      const fbStaffRes = await fetch('/api/booking/staff');
      const fbStaffData = await fbStaffRes.json();
      const fbStaff: FirebaseStaffMember[] = fbStaffData.staff || [];

      // Fetch Square team (source of truth for which staff are bookable)
      const teamRes = await fetch('/api/square/team');
      const teamData = await teamRes.json();
      const squareTeamList: SquareStaffMember[] = teamData.staff || [];

      // Filter to only staff assigned to this service
      const assignedSquareIds = new Set((data.staff || []).map((s: StaffMember) => s.id));
      const filteredStaff = squareTeamList
        .filter(s => assignedSquareIds.has(s.id))
        .map(s => {
          // Overlay Firebase picture/name/title if squareTeamMemberId is linked
          const fbMatch = fbStaff.find((fs) => fs.squareTeamMemberId === s.id);
          if (fbMatch) {
            return {
              ...s,
              displayName: fbMatch.name || s.displayName,
              jobTitle: fbMatch.title || s.jobTitle,
              profileImageUrl: fbMatch.picture || s.profileImageUrl,
            };
          }
          return s;
        });

      setSquareStaff(filteredStaff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch availability for a given date
  const fetchAvailability = useCallback(async (date: string) => {
    if (!selectedVariation) return;

    setLoading(true);
    setError(null);
    try {
      const loc = locationId || await fetchLocationId();
      if (!loc) throw new Error('Could not determine location');

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const res = await fetch('/api/square/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceVariationId: selectedVariation.variationId,
          teamMemberId: selectedStaff?.id || undefined,
          locationId: loc,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAvailabilities(data.availabilities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariation, selectedStaff, locationId]);

  // Pre-check which 7 days in the current week have availability
  const fetchWeekAvailability = useCallback(async (weekStart: Date) => {
    if (!selectedVariation) return;
    setLoadingDates(true);
    const loc = locationId || await fetchLocationId();
    if (!loc) { setLoadingDates(false); return; }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const checks: Record<string, 'available' | 'unavailable'> = {};
    const promises = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      if (day < today) { checks[key] = 'unavailable'; continue; }
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end = new Date(day); end.setHours(23, 59, 59, 999);
      promises.push(
        fetch('/api/square/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceVariationId: selectedVariation.variationId,
            teamMemberId: selectedStaff?.id || undefined,
            locationId: loc,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          }),
        })
          .then(r => r.json())
          .then(data => { checks[key] = (data.availabilities?.length > 0) ? 'available' : 'unavailable'; })
          .catch(() => { checks[key] = 'unavailable'; })
      );
    }

    await Promise.all(promises);
    setDateAvailability(prev => ({ ...prev, ...checks }));

    // Secondary check: days full for selected staff — do any other staff have slots?
    if (selectedStaff) {
      const unavailableKeys = Object.entries(checks)
        .filter(([, v]) => v === 'unavailable')
        .map(([k]) => k);
      const anyStaffChecks: Record<string, boolean> = {};
      await Promise.all(
        unavailableKeys.map(key => {
          const [y, m, d] = key.split('-').map(Number);
          const start = new Date(y, m - 1, d); start.setHours(0, 0, 0, 0);
          const end = new Date(y, m - 1, d); end.setHours(23, 59, 59, 999);
          return fetch('/api/square/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceVariationId: selectedVariation!.variationId,
              teamMemberId: undefined,
              locationId: loc,
              startDate: start.toISOString(),
              endDate: end.toISOString(),
            }),
          })
            .then(r => r.json())
            .then(data => { anyStaffChecks[key] = (data.availabilities?.length > 0); })
            .catch(() => { anyStaffChecks[key] = false; });
        })
      );
      setDateAnyStaffAvail(prev => ({ ...prev, ...anyStaffChecks }));
    }

    setLoadingDates(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariation, selectedStaff, locationId]);

  // Create booking
  const createBooking = async () => {
    if (!selectedSlot || !selectedVariation) return;

    setLoading(true);
    setError(null);
    try {
      const segment = selectedSlot.appointmentSegments[0];
      const res = await fetch('/api/square/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: selectedSlot.locationId,
          startAt: selectedSlot.startAt,
          teamMemberId: segment.teamMemberId,
          serviceVariationId: segment.serviceVariationId,
          serviceVariationVersion: segment.serviceVariationVersion,
          customerFirstName: customerDetails.firstName,
          customerLastName: customerDetails.lastName,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          customerNote: customerDetails.note,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBookingResult(data.booking);
      setActiveStep(5); // Confirmation step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch availability when date changes on date step
  useEffect(() => {
    if (selectedDate && activeStep === 3) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, activeStep, fetchAvailability]);

  // ─── Navigation ──────────────────────────────────────────────────────────
  const steps = bookingPath === 'practitioner' ? pathBSteps : pathASteps;

  const handleSelectPath = (path: BookingPath) => {
    setBookingPath(path);
    setActiveStep(1);
    // Fetch services only when user picks a path
    fetchBookingServices();
  };

  const handleNext = () => {
    if (activeStep === 1 && bookingPath === 'service') {
      // After selecting service — fetch staff
      if (selectedService) {
        fetchServiceStaff(selectedService.squareItemId);
      }
      setActiveStep(2);
    } else if (activeStep === 2 && bookingPath === 'service') {
      // After selecting practitioner — go to date
      setActiveStep(3);
    } else if (activeStep === 3) {
      // After date/time — go to details
      setActiveStep(4);
    } else if (activeStep === 4) {
      // Submit booking
      createBooking();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (activeStep === 1 && !searchParams.get('service')) {
      // Go back to path selection
      setBookingPath(null);
      setActiveStep(0);
    } else if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const canProceed = (): boolean => {
    if (activeStep === 0) return false; // Path selection uses cards directly
    if (activeStep === 1 && bookingPath === 'service') return !!selectedVariation;
    if (activeStep === 2 && bookingPath === 'service') return true; // staff optional
    if (activeStep === 3) return !!selectedSlot;
    if (activeStep === 4) return !!(customerDetails.firstName && customerDetails.email);
    return false;
  };

  // Date options — next 14 days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ minHeight: '80vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        {/* ─── Header ───────────────────────────────────────────────── */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#008d80',
              mb: 1,
            }}
          >
            Book Your Appointment
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: { xs: '1rem', md: '1.15rem' },
              color: '#666',
            }}
          >
            Schedule your wellness session in just a few simple steps
          </Typography>
        </Box>

        {/* ─── Stepper (shown after path selection) ─────────────────── */}
        {bookingPath && (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: { xs: 4, md: 6 },
              '& .MuiStepLabel-label': {
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: { xs: '0.7rem', md: '0.85rem' },
                fontWeight: 600,
                mt: 1,
              },
              '& .MuiStepIcon-root': {
                color: '#e0e0e0',
                fontSize: { xs: '1.3rem', md: '1.8rem' },
                '&.Mui-active': { color: '#008d80' },
                '&.Mui-completed': { color: '#008d80' },
              },
              '& .MuiStepConnector-line': { borderColor: '#e0e0e0' },
            }}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* ─── Error ────────────────────────────────────────────────── */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 0: Choose Your Path                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeStep === 0 && !bookingPath && (
          <Fade in>
            <Box>
              <Card sx={{ ...cardStyle, textAlign: 'center', p: { xs: 4, md: 6 } }}>
                <Typography sx={{ ...stepTitle, fontSize: { xs: '1.6rem', md: '2rem' }, mb: 2, color: '#008d80' }}>
                  How Would You Like to Book?
                </Typography>
                <Typography sx={{ ...stepSubtitle, mb: { xs: 4, md: 5 }, maxWidth: 500, mx: 'auto' }}>
                  Choose the option that works best for you
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: { xs: 2.5, md: 3 },
                    maxWidth: 700,
                    mx: 'auto',
                  }}
                >
                  {/* Card: Book by Service */}
                  <Box
                    onClick={() => handleSelectPath('service')}
                    sx={{
                      p: { xs: 3.5, md: 4.5 },
                      borderRadius: '20px',
                      border: '2px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
                      '&:hover': {
                        borderColor: '#008d80',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0,141,128,0.15)',
                        '& .path-icon': {
                          transform: 'scale(1.1)',
                          bgcolor: '#008d80',
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <Box
                      className="path-icon"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        bgcolor: 'rgba(0,141,128,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Spa sx={{ fontSize: 40, color: '#008d80', transition: 'color 0.3s' }} />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                        fontSize: { xs: '1.2rem', md: '1.4rem' },
                        color: '#333',
                        mb: 1,
                      }}
                    >
                      I Know What I Need
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.95rem',
                        color: '#888',
                        lineHeight: 1.5,
                      }}
                    >
                      Browse our services and choose the treatment that&apos;s right for you
                    </Typography>
                  </Box>

                  {/* Card: Book by Practitioner */}
                  <Box
                    onClick={() => handleSelectPath('practitioner')}
                    sx={{
                      p: { xs: 3.5, md: 4.5 },
                      borderRadius: '20px',
                      border: '2px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: '#008d80',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0,141,128,0.15)',
                        '& .path-icon': {
                          transform: 'scale(1.1)',
                          bgcolor: '#008d80',
                          color: 'white',
                        },
                      },
                    }}
                  >
                    {/* Coming Soon ribbon */}
                    <Chip
                      label="Coming Soon"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(255,152,0,0.1)',
                        color: '#e68a00',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                    <Box
                      className="path-icon"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        bgcolor: 'rgba(0,141,128,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        transition: 'all 0.3s ease',
                        opacity: 0.5,
                      }}
                    >
                      <Person sx={{ fontSize: 40, color: '#008d80', transition: 'color 0.3s' }} />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                        fontSize: { xs: '1.2rem', md: '1.4rem' },
                        color: '#999',
                        mb: 1,
                      }}
                    >
                      I Have a Preferred Therapist
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.95rem',
                        color: '#bbb',
                        lineHeight: 1.5,
                      }}
                    >
                      Choose your practitioner first and book with them directly
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Fade>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PATH A — STEP 1: Select Service (Categorized)             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeStep === 1 && bookingPath === 'service' && (
          <Fade in>
            <Card sx={cardStyle}>
              <Typography sx={stepTitle}>Choose Your Service</Typography>
              <Typography sx={stepSubtitle}>
                Browse our treatments by category
              </Typography>

              {loading && categories.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rounded" height={70} sx={{ borderRadius: '16px' }} />
                  ))}
                </Box>
              ) : categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Spa sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography color="text.secondary">
                    No services available at the moment. Please check back later.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {categories.map((category) => (
                    <Box key={category.categoryId}>
                      {/* Category Header */}
                      <Box
                        onClick={() =>
                          setExpandedCategory(
                            expandedCategory === category.categoryId ? null : category.categoryId
                          )
                        }
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: { xs: 2, md: 2.5 },
                          borderRadius: '14px',
                          bgcolor: expandedCategory === category.categoryId
                            ? 'rgba(0,141,128,0.06)'
                            : '#fafbfc',
                          border: expandedCategory === category.categoryId
                            ? '1.5px solid rgba(0,141,128,0.2)'
                            : '1.5px solid #eee',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            bgcolor: 'rgba(0,141,128,0.04)',
                            borderColor: 'rgba(0,141,128,0.2)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              bgcolor: 'rgba(0,141,128,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Spa sx={{ fontSize: 20, color: '#008d80' }} />
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontWeight: 700,
                                fontSize: { xs: '1rem', md: '1.1rem' },
                                color: '#333',
                              }}
                            >
                              {category.categoryName}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontSize: '0.8rem',
                                color: '#999',
                              }}
                            >
                              {category.services.length} service{category.services.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                        {expandedCategory === category.categoryId ? (
                          <ExpandLess sx={{ color: '#008d80' }} />
                        ) : (
                          <ExpandMore sx={{ color: '#999' }} />
                        )}
                      </Box>

                      {/* Services within Category */}
                      <Collapse in={expandedCategory === category.categoryId}>
                        <Box sx={{ pl: { xs: 1, md: 2 }, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {category.services.map((service) => (
                            <Box key={service.id}>
                              {/* Service name + description */}
                              <Box
                                onClick={() => {
                                  if (service.variations.length > 1) {
                                    // Multi-variation: toggle open to show durations
                                    setSelectedService(
                                      selectedService?.id === service.id ? null : service
                                    );
                                    setSelectedVariation(null);
                                  } else {
                                    // Single variation: select to highlight, but wait for explicit 'Select' button click
                                    setSelectedService(service);
                                    setSelectedVariation(service.variations[0]);
                                  }
                                }}
                                sx={{
                                  p: { xs: 2, md: 2.5 },
                                  borderRadius: '14px',
                                  border: selectedService?.id === service.id
                                    ? '2px solid #008d80'
                                    : '2px solid #f0f0f0',
                                  bgcolor: selectedService?.id === service.id
                                    ? 'rgba(0,141,128,0.03)'
                                    : 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                  '&:hover': {
                                    borderColor: '#008d80',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(0,141,128,0.08)',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      sx={{
                                        fontFamily: '"Source Sans Pro", sans-serif',
                                        fontWeight: 700,
                                        fontSize: { xs: '1rem', md: '1.1rem' },
                                        color: '#333',
                                      }}
                                    >
                                      {service.name}
                                    </Typography>
                                    {service.shortDescription && (
                                      <Typography
                                        sx={{
                                          fontFamily: '"Source Sans Pro", sans-serif',
                                          fontSize: '0.85rem',
                                          color: '#888',
                                          mt: 0.5,
                                          lineHeight: 1.4,
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        {service.shortDescription}
                                      </Typography>
                                    )}
                                  </Box>
                                  {/* Right side: Prices and Select button */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', ml: 2, flexShrink: 0, gap: 1 }}>
                                    {service.variations.length > 0 && (
                                      <>
                                        <Typography
                                          sx={{
                                            fontFamily: '"Source Sans Pro", sans-serif',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            color: '#008d80',
                                          }}
                                        >
                                          {service.variations.length > 1
                                            ? `From ${formatPrice(
                                                Math.min(
                                                  ...service.variations
                                                    .filter(v => v.priceCents !== null)
                                                    .map(v => v.priceCents!)
                                                ),
                                                service.variations[0].currency
                                              )}`
                                            : formatPrice(service.variations[0].priceCents, service.variations[0].currency)}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontFamily: '"Source Sans Pro", sans-serif',
                                            fontSize: '0.75rem',
                                            color: '#aaa',
                                          }}
                                        >
                                          {service.variations.length} option{service.variations.length !== 1 ? 's' : ''}
                                        </Typography>
                                      </>
                                    )}

                                    {/* Action Button for Single Variation Service */}
                                    {service.variations.length === 1 && (
                                      <Chip
                                        label="Select"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent triggering row click again
                                          setSelectedService(service);
                                          setSelectedVariation(service.variations[0]);
                                          // Auto-advance
                                          fetchServiceStaff(service.squareItemId);
                                          setActiveStep(2);
                                        }}
                                        icon={<ArrowForward sx={{ fontSize: '0.85rem' }} />}
                                        size="small"
                                        sx={{
                                          bgcolor: '#008d80',
                                          color: 'white',
                                          fontFamily: '"Source Sans Pro", sans-serif',
                                          fontWeight: 700,
                                          fontSize: '0.8rem',
                                          height: 30,
                                          '& .MuiChip-icon': { color: 'white' },
                                          '&:hover': { bgcolor: '#007067' },
                                          mt: 1,
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>

                              {/* Duration/Variation Selection (shown when multi-variation service is selected) */}
                              {selectedService?.id === service.id && service.variations.length > 1 && (
                                <Fade in>
                                  <Box sx={{ pl: { xs: 1, md: 2 }, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography
                                      sx={{
                                        fontFamily: '"Source Sans Pro", sans-serif',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        color: '#008d80',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        pl: 1,
                                      }}
                                    >
                                      Choose Duration
                                    </Typography>
                                    {service.variations.map((variation) => (
                                      <Box
                                        key={variation.variationId}
                                        onClick={() => {
                                          setSelectedVariation(variation);
                                          // Auto-advance to practitioner step
                                          fetchServiceStaff(service.squareItemId);
                                          setActiveStep(2);
                                        }}
                                        sx={{
                                          p: 2,
                                          borderRadius: '12px',
                                          border: '2px solid #f0f0f0',
                                          bgcolor: 'white',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          '&:hover': {
                                            borderColor: '#008d80',
                                            bgcolor: 'rgba(0,141,128,0.02)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0,141,128,0.08)',
                                          },
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <Typography
                                            sx={{
                                              fontFamily: '"Source Sans Pro", sans-serif',
                                              fontWeight: 600,
                                              fontSize: '0.95rem',
                                              color: '#333',
                                            }}
                                          >
                                            {variation.variationName}
                                          </Typography>
                                          {variation.durationMinutes && (
                                            <Chip
                                              icon={<AccessTime sx={{ fontSize: '0.8rem' }} />}
                                              label={formatDuration(variation.durationMinutes)}
                                              size="small"
                                              sx={{
                                                bgcolor: 'rgba(0,141,128,0.08)',
                                                color: '#008d80',
                                                fontFamily: '"Source Sans Pro", sans-serif',
                                                fontWeight: 500,
                                                height: 26,
                                                fontSize: '0.8rem',
                                              }}
                                            />
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <Typography
                                            sx={{
                                              fontFamily: '"Source Sans Pro", sans-serif',
                                              fontWeight: 700,
                                              fontSize: '1rem',
                                              color: '#008d80',
                                            }}
                                          >
                                            {formatPrice(variation.priceCents, variation.currency)}
                                          </Typography>
                                          <Chip
                                            label="Select"
                                            icon={<ArrowForward sx={{ fontSize: '0.85rem' }} />}
                                            size="small"
                                            sx={{
                                              bgcolor: '#008d80',
                                              color: 'white',
                                              fontFamily: '"Source Sans Pro", sans-serif',
                                              fontWeight: 700,
                                              fontSize: '0.8rem',
                                              height: 30,
                                              '& .MuiChip-icon': { color: 'white' },
                                              '&:hover': { bgcolor: '#007067' },
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Fade>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Fade>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PATH A — STEP 2: Choose Practitioner                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeStep === 2 && bookingPath === 'service' && (
          <Fade in>
            <Card sx={cardStyle}>
              <Typography sx={stepTitle}>Choose Your Practitioner</Typography>
              <Typography sx={stepSubtitle}>
                Select a practitioner for {selectedService?.name || 'your service'}
                {selectedVariation?.variationName ? ` — ${selectedVariation.variationName}` : ''}
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2].map(i => (
                    <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '16px' }} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                  {/* Any Available option */}
                  <Box
                    onClick={() => {
                      setSelectedStaff(null);
                      setActiveStep(3);
                    }}
                    sx={{
                      p: 3,
                      borderRadius: '20px',
                      border: selectedStaff === null
                        ? '2px solid #008d80'
                        : '2px solid #f0f0f0',
                      bgcolor: selectedStaff === null
                        ? 'rgba(0,141,128,0.04)'
                        : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: '#008d80',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,141,128,0.12)',
                        '& .staff-btn': { bgcolor: '#008d80', color: 'white' },
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'rgba(0,141,128,0.1)',
                        color: '#008d80',
                        mb: 2,
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#333',
                        mb: 0.5,
                      }}
                    >
                      Any Available
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.85rem',
                        color: '#888',
                        mb: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      Book the earliest available time with any practitioner
                    </Typography>
                    
                    <Box sx={{ mt: 'auto', width: '100%' }}>
                      <Chip
                        className="staff-btn"
                        label={selectedStaff === null ? "Selected" : "Select"}
                        icon={selectedStaff === null ? <CheckCircle sx={{ fontSize: '1rem' }} /> : undefined}
                        sx={{
                          width: '100%',
                          height: 36,
                          borderRadius: '10px',
                          bgcolor: selectedStaff === null ? '#008d80' : '#f5f5f5',
                          color: selectedStaff === null ? 'white' : '#555',
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Individual staff */}
                  {squareStaff.map((member) => (
                    <Box
                      key={member.id}
                      onClick={() => {
                        setSelectedStaff(member);
                        setActiveStep(3);
                      }}
                      sx={{
                        p: 3,
                        borderRadius: '20px',
                        border: selectedStaff?.id === member.id
                          ? '2px solid #008d80'
                          : '2px solid #f0f0f0',
                        bgcolor: selectedStaff?.id === member.id
                          ? 'rgba(0,141,128,0.04)'
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        '&:hover': {
                          borderColor: '#008d80',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 30px rgba(0,141,128,0.12)',
                          '& .staff-img': { transform: 'scale(1.05)' },
                          '& .staff-btn': { bgcolor: '#008d80', color: 'white' },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          mb: 2,
                          border: '3px solid',
                          borderColor: selectedStaff?.id === member.id ? '#008d80' : 'transparent',
                          padding: '2px',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Avatar
                          className="staff-img"
                          src={member.profileImageUrl || undefined}
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: '#f0f0f0',
                            color: '#008d80',
                            fontSize: '1.5rem',
                            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          }}
                        >
                          {member.displayName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: '#333',
                          mb: 0.5,
                        }}
                      >
                        {member.displayName}
                      </Typography>
                      {member.jobTitle && (
                        <Typography
                          sx={{
                            fontFamily: '"Source Sans Pro", sans-serif',
                            fontSize: '0.85rem',
                            color: '#008d80',
                            fontWeight: 600,
                            mb: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {member.jobTitle}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 'auto', width: '100%' }}>
                        <Chip
                          className="staff-btn"
                          label={selectedStaff?.id === member.id ? "Selected" : "Select"}
                          icon={selectedStaff?.id === member.id ? <CheckCircle sx={{ fontSize: '1rem' }} /> : undefined}
                          sx={{
                            width: '100%',
                            height: 36,
                            borderRadius: '10px',
                            bgcolor: selectedStaff?.id === member.id ? '#008d80' : '#f5f5f5',
                            color: selectedStaff?.id === member.id ? 'white' : '#555',
                            fontFamily: '"Source Sans Pro", sans-serif',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            '& .MuiChip-icon': { color: 'white' },
                          }}
                        />
                      </Box>
                    </Box>
                  ))}

                  {squareStaff.length === 0 && !loading && (
                    <Typography
                      sx={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '0.9rem',
                        color: '#999',
                        textAlign: 'center',
                        py: 2,
                      }}
                    >
                      Staff information is loading. You can choose &quot;Any Available&quot; above.
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
          </Fade>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 3: Pick Date & Time                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeStep === 3 && (
          <Fade in>
            <Card sx={cardStyle}>
              <Typography sx={stepTitle}>Pick a Date & Time</Typography>
              <Typography sx={stepSubtitle}>
                Choose when you&apos;d like your appointment
              </Typography>

              {/* ── Week Navigator Header ── */}
              {(() => {
                const weekEnd = new Date(calendarWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const today = new Date(); today.setHours(0,0,0,0);
                const isFirstWeek = calendarWeekStart <= today;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box
                      onClick={() => {
                        if (isFirstWeek) return;
                        const prev = new Date(calendarWeekStart);
                        prev.setDate(prev.getDate() - 7);
                        setCalendarWeekStart(prev);
                        setSelectedDate('');
                        setSelectedSlot(null);
                      }}
                      sx={{ cursor: isFirstWeek ? 'not-allowed' : 'pointer', p: 1, borderRadius: '8px', opacity: isFirstWeek ? 0.3 : 1, '&:hover': !isFirstWeek ? { bgcolor: 'rgba(0,141,128,0.08)' } : {} }}
                    >
                      <ArrowBack sx={{ color: '#008d80' }} />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.15rem', color: '#333' }}>
                        {calendarWeekStart.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}
                        {' – '}
                        {weekEnd.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        const next = new Date(calendarWeekStart);
                        next.setDate(next.getDate() + 7);
                        setCalendarWeekStart(next);
                        setSelectedDate('');
                        setSelectedSlot(null);
                      }}
                      sx={{ cursor: 'pointer', p: 1, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(0,141,128,0.08)' } }}
                    >
                      <ArrowForward sx={{ color: '#008d80' }} />
                    </Box>
                  </Box>
                );
              })()}

              {/* ── 7-Day Week Cards ── */}
              {(() => {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

                return (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.5, mb: 3 }}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const dayDate = new Date(calendarWeekStart);
                      dayDate.setDate(dayDate.getDate() + i);
                      const y = dayDate.getFullYear();
                      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
                      const d = String(dayDate.getDate()).padStart(2, '0');
                      const dateKey = `${y}-${m}-${d}`;
                      const isPast = dayDate < today;
                      const avail = dateAvailability[dateKey];
                      const isSelected = selectedDate === dateKey;
                      const hasOtherStaff = !isPast && avail === 'unavailable' && dateAnyStaffAvail[dateKey] === true;
                      const isUnavailable = (isPast || avail === 'unavailable') && !hasOtherStaff;
                      const isChecking = loadingDates && !avail && !isPast;

                      return (
                        <Box
                          key={i}
                          onClick={() => {
                            if (hasOtherStaff) {
                              setSelectedStaff(null);
                              setSelectedDate(dateKey);
                              setSelectedSlot(null);
                              fetchAvailability(dateKey);
                              return;
                            }
                            if (isUnavailable || isChecking) return;
                            setSelectedDate(dateKey);
                            setSelectedSlot(null);
                            fetchAvailability(dateKey);
                          }}
                          sx={{
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center', // use center to avoid pushing to bottom
                            py: 1.5,
                            px: 0.5,
                            minHeight: 125, // give a bit more room for the dual badge
                            cursor: isUnavailable && !hasOtherStaff ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            border: isSelected
                              ? '2px solid #008d80'
                              : hasOtherStaff
                              ? '2px solid #f59e0b'
                              : isPast
                              ? '2px solid #f0f0f0'
                              : '2px solid #eee',
                            bgcolor: isSelected
                              ? 'rgba(0,141,128,0.08)'
                              : hasOtherStaff
                              ? 'rgba(245,158,11,0.07)'
                              : isPast
                              ? '#fbfbfb'
                              : avail === 'unavailable'
                              ? '#fff8f8'
                              : avail === 'available'
                              ? 'rgba(0,141,128,0.03)'
                              : 'white',
                            opacity: isPast ? 0.4 : 1,
                            boxShadow: isSelected ? '0 4px 16px rgba(0,141,128,0.15)' : hasOtherStaff ? '0 4px 16px rgba(245,158,11,0.12)' : 'none',
                            '&:hover': (!isUnavailable || hasOtherStaff) ? {
                              borderColor: hasOtherStaff ? '#f59e0b' : '#008d80',
                              transform: 'translateY(-3px)',
                              boxShadow: hasOtherStaff ? '0 8px 24px rgba(245,158,11,0.2)' : '0 8px 24px rgba(0,141,128,0.15)',
                            } : {},
                          }}
                        >
                          {/* Day label */}
                          <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontWeight: 700, fontSize: '0.7rem', color: isSelected ? '#008d80' : hasOtherStaff ? '#d97706' : isPast ? '#ccc' : '#999', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                            {dayLabels[i]}
                          </Typography>

                          {/* Date number */}
                          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.6rem', lineHeight: 1, color: isSelected ? '#008d80' : hasOtherStaff ? '#b45309' : isPast ? '#ccc' : '#222', mb: 0.1 }}>
                            {dayDate.getDate()}
                          </Typography>

                          {/* Month abbrev */}
                          <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontSize: '0.7rem', color: isSelected ? '#008d80' : '#bbb', fontWeight: 600, mb: 1.5 }}>
                            {monthLabels[dayDate.getMonth()]}
                          </Typography>

                          {/* Status badge wrapper (no auto margins) */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 0.4 }}>
                            {isChecking && (
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ddd' }} />
                            )}
                            {!isPast && avail === 'available' && !isSelected && (
                              <Box sx={{ px: 1, py: 0.3, borderRadius: '5px', bgcolor: 'rgba(0,141,128,0.1)' }}>
                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: '#008d80', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Open</Typography>
                              </Box>
                            )}
                            {isSelected && (
                              <Box sx={{ px: 1, py: 0.3, borderRadius: '5px', bgcolor: '#008d80' }}>
                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Selected</Typography>
                              </Box>
                            )}
                            {!isPast && avail === 'unavailable' && !hasOtherStaff && (
                              <Box sx={{ px: 1, py: 0.3, borderRadius: '5px', bgcolor: '#fef2f2' }}>
                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Full</Typography>
                              </Box>
                            )}
                            {hasOtherStaff && (
                              <>
                                <Box sx={{ px: 1, py: 0.25, borderRadius: '4px', bgcolor: '#fef2f2', width: '90%', textAlign: 'center' }}>
                                  <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>Full</Typography>
                                </Box>
                                <Box sx={{ px: 1, py: 0.35, borderRadius: '5px', bgcolor: '#f59e0b', width: '98%', textAlign: 'center', boxShadow: '0 2px 4px rgba(245,158,11,0.2)' }}>
                                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1 }}>Others Free ↗</Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })()}

              {/* ── Legend ── */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { color: '#008d80', label: 'Available', bg: 'rgba(0,141,128,0.1)', text: 'Open' },
                  { color: '#ef4444', label: 'Fully Booked', bg: '#fef2f2', text: 'Full' },
                  { color: 'white', label: 'Others free — tap to switch practitioner', bg: '#f59e0b', text: 'Others Free ↗' },
                ].map(({ color, label, bg, text }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ px: 0.8, py: 0.3, borderRadius: '5px', bgcolor: bg }}>
                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{text}</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontSize: '0.78rem', color: '#888' }}>{label}</Typography>
                  </Box>
                ))}
              </Box>

              {/* ── Time Slots ── */}
              {selectedDate && (
                <Box>
                  <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#333', mb: 2 }}>
                    Available Times — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} variant="rounded" width={110} height={52} sx={{ borderRadius: '14px' }} />
                      ))}
                    </Box>
                  ) : availabilities.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5, borderRadius: '16px', bgcolor: '#fafafa', border: '1.5px dashed #e0e0e0' }}>
                      <CalendarMonth sx={{ fontSize: 44, color: '#ddd', mb: 1 }} />
                      <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', color: '#aaa', fontWeight: 600 }}>
                        No available times for this date
                      </Typography>
                      <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontSize: '0.85rem', color: '#bbb', mt: 0.5 }}>
                        Try selecting another day
                      </Typography>
                    </Box>
                  ) : (() => {
                    const am = availabilities.filter(s => new Date(s.startAt).getHours() < 12);
                    const pm = availabilities.filter(s => new Date(s.startAt).getHours() >= 12);
                    const renderSlots = (slots: typeof availabilities) => (
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {slots.map((slot, i) => {
                          const isSelected = selectedSlot === slot;
                          return (
                            <Box
                              key={i}
                              onClick={() => setSelectedSlot(isSelected ? null : slot)}
                              sx={{
                                px: 2.5,
                                py: 1.5,
                                borderRadius: '14px',
                                border: isSelected ? '2px solid #008d80' : '2px solid #eee',
                                bgcolor: isSelected ? 'rgba(0,141,128,0.08)' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minWidth: 90,
                                '&:hover': { borderColor: '#008d80', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,141,128,0.1)' },
                              }}
                            >
                              <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontWeight: 700, fontSize: '1rem', color: isSelected ? '#008d80' : '#333' }}>
                                {formatSlotTime(slot.startAt).split(' ')[0]}
                              </Typography>
                              <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontSize: '0.75rem', color: isSelected ? '#008d80' : '#aaa', fontWeight: 600 }}>
                                {formatSlotTime(slot.startAt).split(' ')[1]}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {am.length > 0 && (
                          <Box>
                            <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>Morning</Typography>
                            {renderSlots(am)}
                          </Box>
                        )}
                        {pm.length > 0 && (
                          <Box>
                            <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>Afternoon & Evening</Typography>
                            {renderSlots(pm)}
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </Box>
              )}
            </Card>
          </Fade>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 4: Customer Details                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeStep === 4 && (
          <Fade in>
            <Card sx={cardStyle}>
              <Typography sx={stepTitle}>Your Details</Typography>
              <Typography sx={stepSubtitle}>
                Please provide your contact information
              </Typography>

              {/* Booking Summary */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  bgcolor: 'rgba(0,141,128,0.04)',
                  border: '1px solid rgba(0,141,128,0.1)',
                  mb: 4,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#008d80',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Booking Summary
                </Typography>
                <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', fontWeight: 600, color: '#333' }}>
                  {selectedService?.name}{' '}
                  {selectedVariation?.variationName && selectedVariation.variationName !== 'Regular'
                    ? `— ${selectedVariation.variationName}`
                    : ''}
                </Typography>
                <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', color: '#666', fontSize: '0.95rem' }}>
                  {selectedStaff ? `with ${selectedStaff.displayName}` : 'Any available practitioner'}
                  {' • '}
                  {selectedSlot
                    ? new Date(selectedSlot.startAt).toLocaleDateString('en-CA', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''}
                  {' at '}
                  {selectedSlot ? formatSlotTime(selectedSlot.startAt) : ''}
                </Typography>
                {selectedVariation && (
                  <Typography
                    sx={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 700,
                      color: '#008d80',
                      mt: 0.5,
                    }}
                  >
                    {formatPrice(selectedVariation.priceCents, selectedVariation.currency)}
                    {selectedVariation.durationMinutes
                      ? ` • ${formatDuration(selectedVariation.durationMinutes)}`
                      : ''}
                  </Typography>
                )}
              </Box>

              {/* Form Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="First Name"
                    required
                    fullWidth
                    value={customerDetails.firstName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    sx={textFieldSx}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={customerDetails.lastName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    sx={textFieldSx}
                  />
                </Box>
                <TextField
                  label="Email Address"
                  type="email"
                  required
                  fullWidth
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  sx={textFieldSx}
                />
                <TextField
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  sx={textFieldSx}
                />
                <TextField
                  label="Notes (optional)"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Any special requests or health concerns..."
                  value={customerDetails.note}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, note: e.target.value }))}
                  sx={textFieldSx}
                />
              </Box>
            </Card>
          </Fade>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 5: Confirmation                                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeStep === 5 && (
          <Fade in>
            <Card sx={{ ...cardStyle, textAlign: 'center', py: { xs: 3, md: 5 } }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0,141,128,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircle sx={{ fontSize: 48, color: '#008d80' }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  color: '#008d80',
                  mb: 1,
                }}
              >
                Booking Confirmed!
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: '1.05rem',
                  color: '#666',
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                Your appointment has been successfully scheduled. You&apos;ll receive a
                confirmation at {customerDetails.email}.
              </Typography>

              {bookingResult && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: 'rgba(0,141,128,0.04)',
                    border: '1px solid rgba(0,141,128,0.1)',
                    maxWidth: 450,
                    mx: 'auto',
                    textAlign: 'left',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 700,
                      color: '#333',
                      mb: 2,
                    }}
                  >
                    Appointment Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', color: '#666' }}>
                        Service
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontWeight: 600,
                          color: '#333',
                        }}
                      >
                        {selectedService?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', color: '#666' }}>
                        Date & Time
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Source Sans Pro", sans-serif',
                          fontWeight: 600,
                          color: '#333',
                        }}
                      >
                        {selectedSlot
                          ? new Date(selectedSlot.startAt).toLocaleDateString('en-CA', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                        {' at '}
                        {selectedSlot ? formatSlotTime(selectedSlot.startAt) : ''}
                      </Typography>
                    </Box>
                    {selectedVariation?.priceCents && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', color: '#666' }}>
                          Price
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"Source Sans Pro", sans-serif',
                            fontWeight: 700,
                            color: '#008d80',
                          }}
                        >
                          {formatPrice(selectedVariation.priceCents, selectedVariation.currency)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              <Button
                component="a"
                href="/"
                sx={{
                  mt: 4,
                  bgcolor: '#008d80',
                  color: 'white',
                  textTransform: 'none',
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': {
                    bgcolor: '#007067',
                  },
                }}
              >
                Return to Home
              </Button>
            </Card>
          </Fade>
        )}

        {/* ─── Navigation Buttons ───────────────────────────────────── */}
        {activeStep > 0 && activeStep < 5 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
            }}
          >
            <Button
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{
                color: '#008d80',
                textTransform: 'none',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontWeight: 600,
                fontSize: '1rem',
                px: 3,
                py: 1.2,
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: 'rgba(0,141,128,0.08)',
                },
              }}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              endIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <ArrowForward />
                )
              }
              sx={{
                bgcolor: '#008d80',
                color: 'white',
                textTransform: 'none',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.2,
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,141,128,0.3)',
                '&:hover': {
                  bgcolor: '#007067',
                  boxShadow: '0 6px 24px rgba(0,141,128,0.4)',
                },
                '&.Mui-disabled': {
                  bgcolor: '#ccc',
                  color: 'white',
                },
              }}
            >
              {activeStep === 4 ? 'Confirm Booking' : 'Continue'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
