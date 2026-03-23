'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ServiceService, Service } from '@/lib/serviceService';
import { StaffService, StaffMember } from '@/lib/staffService';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  TextField,
  Checkbox,
  Paper,
  Tooltip,
  Fade,
  IconButton,
} from '@mui/material';
import {
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as MoneyIcon,
  Storefront as SquareIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import BrandButton from '@/components/shared/BrandButton';
import BrandTypography from '@/components/shared/BrandTypography';

// Types for Square data
interface SquareVariation {
  id: string;
  name: string;
  durationMinutes: number | null;
  priceCents: number | null;
  currency: string;
  version: string;
}

interface SquareService {
  id: string;
  name: string;
  description: string;
  variations: SquareVariation[];
  durationMinutes: number | null;
  priceCents: number | null;
  currency: string;
}

// Mapping state for a single website service
interface ServiceMappingState {
  squareItemId: string | null;
  squareItemName: string;
  selectedVariations: SquareVariation[];
  isDirty: boolean;
}

function formatPrice(cents: number | null, currency: string): string {
  if (cents === null) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency || 'CAD',
  }).format(cents / 100);
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes}min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
}

// Services Tab Component
function ServicesTab() {
  const [websiteServices, setWebsiteServices] = useState<Service[]>([]);
  const [squareServices, setSquareServices] = useState<SquareService[]>([]);
  const [mappings, setMappings] = useState<Record<string, ServiceMappingState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [services, squareRes] = await Promise.all([
        ServiceService.getServices(),
        fetch('/api/square/services').then(r => r.json()),
      ]);

      setWebsiteServices(services);
      setSquareServices(squareRes.services || []);

      // Initialize mappings from existing data
      const initialMappings: Record<string, ServiceMappingState> = {};
      services.forEach(service => {
        if (service.squareMapping) {
          initialMappings[service.id] = {
            squareItemId: service.squareMapping.squareItemId,
            squareItemName: service.squareMapping.squareItemName,
            selectedVariations: service.squareMapping.variations.map(v => ({
              id: v.variationId,
              name: v.variationName,
              durationMinutes: v.durationMinutes,
              priceCents: v.priceCents,
              currency: v.currency,
              version: v.version,
            })),
            isDirty: false,
          };
        } else {
          initialMappings[service.id] = {
            squareItemId: null,
            squareItemName: '',
            selectedVariations: [],
            isDirty: false,
          };
        }
      });
      setMappings(initialMappings);
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSquareServiceSelect = (websiteServiceId: string, squareService: SquareService | null) => {
    setMappings(prev => ({
      ...prev,
      [websiteServiceId]: {
        squareItemId: squareService?.id || null,
        squareItemName: squareService?.name || '',
        selectedVariations: squareService?.variations || [],
        isDirty: true,
      },
    }));
  };

  const handleVariationToggle = (websiteServiceId: string, variation: SquareVariation) => {
    setMappings(prev => {
      const current = prev[websiteServiceId];
      const isSelected = current.selectedVariations.some(v => v.id === variation.id);
      return {
        ...prev,
        [websiteServiceId]: {
          ...current,
          selectedVariations: isSelected
            ? current.selectedVariations.filter(v => v.id !== variation.id)
            : [...current.selectedVariations, variation],
          isDirty: true,
        },
      };
    });
  };

  const handleSaveMapping = async (websiteServiceId: string) => {
    const mapping = mappings[websiteServiceId];
    setSaving(websiteServiceId);

    try {
      const squareMapping = mapping.squareItemId
        ? {
            squareItemId: mapping.squareItemId,
            squareItemName: mapping.squareItemName,
            variations: mapping.selectedVariations.map(v => ({
              variationId: v.id,
              variationName: v.name,
              version: v.version,
              durationMinutes: v.durationMinutes,
              priceCents: v.priceCents,
              currency: v.currency,
            })),
          }
        : undefined;

      await ServiceService.updateService(websiteServiceId, {
        squareMapping: squareMapping || null as unknown as undefined,
      });

      setMappings(prev => ({
        ...prev,
        [websiteServiceId]: { ...prev[websiteServiceId], isDirty: false },
      }));

      setSnackbar({ open: true, message: 'Mapping saved successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving mapping:', error);
      setSnackbar({ open: true, message: 'Failed to save mapping', severity: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const handleUnlink = (websiteServiceId: string) => {
    setMappings(prev => ({
      ...prev,
      [websiteServiceId]: {
        squareItemId: null,
        squareItemName: '',
        selectedVariations: [],
        isDirty: true,
      },
    }));
  };

  const linkedCount = Object.values(mappings).filter(m => m.squareItemId).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress sx={{ mr: 2 }} />
        <BrandTypography variant="text">Loading services from website and Square...</BrandTypography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary strip */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          icon={<SquareIcon />}
          label={`${squareServices.length} Square services`}
          sx={{ bgcolor: 'rgba(0,141,128,0.08)', color: '#008d80', fontWeight: 600 }}
        />
        <Chip
          icon={<LinkIcon />}
          label={`${linkedCount} of ${websiteServices.length} linked`}
          color={linkedCount === websiteServices.length ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Reload data from Square">
          <IconButton onClick={loadData} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mapping rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {websiteServices.map(service => {
          const mapping = mappings[service.id] || { squareItemId: null, squareItemName: '', selectedVariations: [], isDirty: false };
          const isLinked = !!mapping.squareItemId;
          const selectedSquareService = squareServices.find(s => s.id === mapping.squareItemId);

          return (
            <Paper
              key={service.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: isLinked ? '2px solid rgba(0,141,128,0.3)' : '2px solid #e8e8e8',
                bgcolor: isLinked ? 'rgba(0,141,128,0.02)' : 'white',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Row header: Website service name + link status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {/* Link status icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isLinked ? 'rgba(0,141,128,0.1)' : 'rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                  {isLinked ? (
                    <LinkIcon sx={{ fontSize: 20, color: '#008d80' }} />
                  ) : (
                    <LinkOffIcon sx={{ fontSize: 20, color: '#aaa' }} />
                  )}
                </Box>

                {/* Website service name */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <BrandTypography variant="text" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {service.name}
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {service.sessionDurations?.length || 0} duration(s) on website
                    {service.sessionDurations?.length > 0 && ` • ${service.sessionDurations.map(d => `${d.duration}min`).join(', ')}`}
                  </BrandTypography>
                </Box>

                {/* Save / Unlink buttons */}
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {isLinked && (
                    <Tooltip title="Unlink from Square">
                      <IconButton
                        size="small"
                        onClick={() => handleUnlink(service.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <BrandButton
                    variant={mapping.isDirty ? 'primary' : 'secondary'}
                    onClick={() => handleSaveMapping(service.id)}
                    disabled={!mapping.isDirty || saving === service.id}
                    icon={saving === service.id ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 2,
                      opacity: mapping.isDirty ? 1 : 0.5,
                    }}
                  >
                    {saving === service.id ? 'Saving...' : 'Save'}
                  </BrandButton>
                </Box>
              </Box>

              {/* Square service selector */}
              <Autocomplete
                options={squareServices}
                getOptionLabel={(option) => option.name}
                value={selectedSquareService || null}
                onChange={(_, newValue) => handleSquareServiceSelect(service.id, newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a Square service to link..."
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        bgcolor: 'white',
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props;
                  return (
                    <li key={key} {...restProps}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Box sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{option.name}</Box>
                        <Box sx={{ fontSize: '0.8rem', color: '#888', display: 'flex', gap: 1 }}>
                          {option.variations.length} variation(s)
                          {option.priceCents !== null && (
                            <span>• from {formatPrice(option.priceCents, option.currency)}</span>
                          )}
                        </Box>
                      </Box>
                    </li>
                  );
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                sx={{ mb: isLinked ? 2 : 0 }}
              />

              {/* Variations checkboxes — only shown when a Square service is selected */}
              {isLinked && selectedSquareService && (
                <Fade in>
                  <Box>
                    <BrandTypography
                      variant="caption"
                      sx={{ fontWeight: 600, color: '#008d80', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      Select which variations to offer on the booking page:
                    </BrandTypography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedSquareService.variations.map(variation => {
                        const isSelected = mapping.selectedVariations.some(v => v.id === variation.id);
                        return (
                          <Box
                            key={variation.id}
                            onClick={() => handleVariationToggle(service.id, variation)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: '8px 14px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #008d80' : '2px solid #e0e0e0',
                              bgcolor: isSelected ? 'rgba(0,141,128,0.06)' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                borderColor: '#008d80',
                                bgcolor: 'rgba(0,141,128,0.03)',
                              },
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              size="small"
                              sx={{
                                p: 0,
                                color: '#ccc',
                                '&.Mui-checked': { color: '#008d80' },
                              }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#333' }}>
                                {variation.name}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {variation.durationMinutes && (
                                  <Box sx={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                    <AccessTimeIcon sx={{ fontSize: '0.85rem' }} />
                                    {formatDuration(variation.durationMinutes)}
                                  </Box>
                                )}
                                {variation.priceCents !== null && (
                                  <Box sx={{ fontSize: '0.75rem', color: '#008d80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                    <MoneyIcon sx={{ fontSize: '0.85rem' }} />
                                    {formatPrice(variation.priceCents, variation.currency)}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: '#008d80', ml: 0.5 }} />}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Fade>
              )}
            </Paper>
          );
        })}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Types for Square team members
interface SquareTeamMember {
  id: string;
  displayName: string;
  description: string;
  profileImageUrl: string | null;
  isBookable: boolean;
  jobTitle: string;
}

// Staff mapping state
interface StaffMappingState {
  squareTeamMemberId: string | null;
  squareDisplayName: string;
  isDirty: boolean;
}

// Staff Tab Component
function StaffTab() {
  const [websiteStaff, setWebsiteStaff] = useState<StaffMember[]>([]);
  const [squareTeam, setSquareTeam] = useState<SquareTeamMember[]>([]);
  const [mappings, setMappings] = useState<Record<string, StaffMappingState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [staff, teamRes] = await Promise.all([
        StaffService.getStaff(),
        fetch('/api/square/team').then(r => r.json()),
      ]);

      setWebsiteStaff(staff);
      setSquareTeam(teamRes.staff || []);

      // Initialize mappings from existing data
      const initialMappings: Record<string, StaffMappingState> = {};
      staff.forEach(member => {
        const linkedSquareMember = member.squareTeamMemberId
          ? (teamRes.staff || []).find((t: SquareTeamMember) => t.id === member.squareTeamMemberId)
          : null;
        initialMappings[member.id] = {
          squareTeamMemberId: member.squareTeamMemberId || null,
          squareDisplayName: linkedSquareMember?.displayName || '',
          isDirty: false,
        };
      });
      setMappings(initialMappings);
    } catch (error) {
      console.error('Error loading staff data:', error);
      setSnackbar({ open: true, message: 'Failed to load staff data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSquareTeamSelect = (websiteStaffId: string, squareMember: SquareTeamMember | null) => {
    setMappings(prev => ({
      ...prev,
      [websiteStaffId]: {
        squareTeamMemberId: squareMember?.id || null,
        squareDisplayName: squareMember?.displayName || '',
        isDirty: true,
      },
    }));
  };

  const handleSaveMapping = async (websiteStaffId: string) => {
    const mapping = mappings[websiteStaffId];
    setSaving(websiteStaffId);

    try {
      await StaffService.updateStaff(websiteStaffId, {
        squareTeamMemberId: mapping.squareTeamMemberId || undefined,
      });

      setMappings(prev => ({
        ...prev,
        [websiteStaffId]: { ...prev[websiteStaffId], isDirty: false },
      }));

      setSnackbar({ open: true, message: 'Staff mapping saved', severity: 'success' });
    } catch (error) {
      console.error('Error saving staff mapping:', error);
      setSnackbar({ open: true, message: 'Failed to save mapping', severity: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const handleUnlink = (websiteStaffId: string) => {
    setMappings(prev => ({
      ...prev,
      [websiteStaffId]: {
        squareTeamMemberId: null,
        squareDisplayName: '',
        isDirty: true,
      },
    }));
  };

  // Track which Square members are already linked
  const linkedSquareIds = new Set(
    Object.values(mappings)
      .map(m => m.squareTeamMemberId)
      .filter(Boolean)
  );

  const linkedCount = Object.values(mappings).filter(m => m.squareTeamMemberId).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress sx={{ mr: 2 }} />
        <BrandTypography variant="text">Loading staff from website and Square...</BrandTypography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary strip */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          icon={<PeopleIcon />}
          label={`${squareTeam.length} Square team members`}
          sx={{ bgcolor: 'rgba(0,141,128,0.08)', color: '#008d80', fontWeight: 600 }}
        />
        <Chip
          icon={<LinkIcon />}
          label={`${linkedCount} of ${websiteStaff.length} linked`}
          color={linkedCount === websiteStaff.length ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Reload data from Square">
          <IconButton onClick={loadData} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mapping rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {websiteStaff.map(member => {
          const mapping = mappings[member.id] || { squareTeamMemberId: null, squareDisplayName: '', isDirty: false };
          const isLinked = !!mapping.squareTeamMemberId;
          const selectedSquareMember = squareTeam.find(t => t.id === mapping.squareTeamMemberId);

          return (
            <Paper
              key={member.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: isLinked ? '2px solid rgba(0,141,128,0.3)' : '2px solid #e8e8e8',
                bgcolor: isLinked ? 'rgba(0,141,128,0.02)' : 'white',
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {/* Link status icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isLinked ? 'rgba(0,141,128,0.1)' : 'rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                  {isLinked ? (
                    <LinkIcon sx={{ fontSize: 20, color: '#008d80' }} />
                  ) : (
                    <LinkOffIcon sx={{ fontSize: 20, color: '#aaa' }} />
                  )}
                </Box>

                {/* Website staff info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <BrandTypography variant="text" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {member.name}
                  </BrandTypography>
                  <BrandTypography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {member.title}
                    {member.email && ` • ${member.email}`}
                  </BrandTypography>
                </Box>

                {/* Save / Unlink buttons */}
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {isLinked && (
                    <Tooltip title="Unlink from Square">
                      <IconButton
                        size="small"
                        onClick={() => handleUnlink(member.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <BrandButton
                    variant={mapping.isDirty ? 'primary' : 'secondary'}
                    onClick={() => handleSaveMapping(member.id)}
                    disabled={!mapping.isDirty || saving === member.id}
                    icon={saving === member.id ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 2,
                      opacity: mapping.isDirty ? 1 : 0.5,
                    }}
                  >
                    {saving === member.id ? 'Saving...' : 'Save'}
                  </BrandButton>
                </Box>
              </Box>

              {/* Square team member selector */}
              <Autocomplete
                options={squareTeam}
                getOptionLabel={(option) => option.displayName}
                value={selectedSquareMember || null}
                onChange={(_, newValue) => handleSquareTeamSelect(member.id, newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a Square team member to link..."
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        bgcolor: 'white',
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props;
                  const alreadyLinked = linkedSquareIds.has(option.id) && option.id !== mapping.squareTeamMemberId;
                  return (
                    <li key={key} {...restProps} style={{ opacity: alreadyLinked ? 0.5 : 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{option.displayName}</Box>
                          {alreadyLinked && (
                            <Chip label="already linked" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                        <Box sx={{ fontSize: '0.8rem', color: '#888' }}>
                          {option.jobTitle || option.description || 'Team member'}
                        </Box>
                      </Box>
                    </li>
                  );
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Paper>
          );
        })}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Main Page
export default function SquarePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <BrandTypography variant="header">Square Integration</BrandTypography>
        </Box>

        <BrandTypography variant="text" sx={{ color: 'text.secondary', mb: 3 }}>
          Link your website services and staff with Square to enable seamless online booking.
        </BrandTypography>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              minHeight: 48,
            },
            '& .Mui-selected': {
              color: '#008d80 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#008d80',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<SquareIcon />} iconPosition="start" label="Services" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Staff" />
        </Tabs>

        {activeTab === 0 && <ServicesTab />}
        {activeTab === 1 && <StaffTab />}
      </Box>
    </Container>
  );
}
