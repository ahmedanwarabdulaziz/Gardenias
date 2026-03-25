'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SquareCardFormProps {
  applicationId: string;
  locationId: string;
  onTokenize: (token: string, verificationToken: string) => Promise<void>;
  onError: (error: string) => void;
  customerName?: string;
  loading?: boolean;
}

export default function SquareCardForm({
  applicationId,
  locationId,
  onTokenize,
  onError,
  customerName,
  loading = false,
}: SquareCardFormProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardInstanceRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [tokenizing, setTokenizing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const initAttemptedRef = useRef(false);

  // ── Step 1: Load the Square Web Payments SDK script ─────────────
  useEffect(() => {
    if ((window as any).Square) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="squarecdn.com"]');
    if (existingScript) {
      const interval = setInterval(() => {
        if ((window as any).Square) { clearInterval(interval); setSdkReady(true); }
      }, 200);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!(window as any).Square) setInitError('Square SDK failed to load. Please refresh.');
      }, 15000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }

    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => {
      const interval = setInterval(() => {
        if ((window as any).Square) { clearInterval(interval); setSdkReady(true); }
      }, 100);
      setTimeout(() => clearInterval(interval), 10000);
    };
    script.onerror = () => setInitError('Failed to load Square payment form.');
    document.head.appendChild(script);
  }, []);

  // ── Step 2: Initialize card form ────────────────────────────────
  useEffect(() => {
    if (!sdkReady || initAttemptedRef.current) return;
    if (!applicationId) {
      setInitError('Square Application ID is missing. Restart the dev server.');
      return;
    }
    if (!locationId) {
      setInitError('Location ID is missing. Go back and re-select a service.');
      return;
    }

    const container = cardContainerRef.current;
    if (!container) return;

    initAttemptedRef.current = true;

    const initCard = async () => {
      try {
        const sq = (window as any).Square;
        const payments = await sq.payments(applicationId, locationId);
        paymentsRef.current = payments;

        const card = await payments.card();
        await card.attach(container);

        cardInstanceRef.current = card;
        setCardReady(true);
      } catch (err: any) {
        console.error('[SquareCardForm] Init error:', err?.message || err);
        setInitError(`Card form failed to load: ${err?.message || 'Unknown error'}`);
      }
    };

    initCard();

    return () => {
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy().catch(() => {});
        cardInstanceRef.current = null;
        setCardReady(false);
        initAttemptedRef.current = false;
      }
    };
  }, [sdkReady, applicationId, locationId]);

  // ── Tokenize + Verify Buyer (SCA) ──────────────────────────────
  const handleTokenize = useCallback(async () => {
    if (!cardInstanceRef.current || !paymentsRef.current) {
      onError('Card form not ready. Please wait or refresh.');
      return;
    }
    setTokenizing(true);
    try {
      // Step 1: Tokenize the card
      const tokenResult = await cardInstanceRef.current.tokenize();
      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        const errorMsg = tokenResult.errors?.map((e: any) => e.message).join(', ') ||
          'Card verification failed. Please check your details.';
        onError(errorMsg);
        return;
      }

      // Step 2: Verify buyer (required by Square for saving cards on file)
      const verificationDetails = {
        intent: 'STORE',
        billingContact: {
          givenName: customerName || 'Customer',
        },
      };

      const verificationResult = await paymentsRef.current.verifyBuyer(
        tokenResult.token,
        verificationDetails
      );

      if (!verificationResult?.token) {
        onError('Buyer verification failed. Please try again.');
        return;
      }

      // Step 3: Send both tokens to the backend
      await onTokenize(tokenResult.token, verificationResult.token);
    } catch (err: any) {
      console.error('[SquareCardForm] Tokenize error:', err);
      onError(err?.message || 'Payment processing failed.');
    } finally {
      setTokenizing(false);
    }
  }, [onTokenize, onError, customerName]);

  const isLoading = loading || tokenizing;

  return (
    <Box>
      {initError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {initError}
        </Alert>
      )}

      {/* Loading indicator — OUTSIDE the Square container */}
      {!cardReady && !initError && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1.5 }}>
          <CircularProgress size={20} sx={{ color: '#008d80' }} />
          <Typography sx={{ fontFamily: '"Source Sans Pro", sans-serif', color: '#888', fontSize: '0.9rem' }}>
            Loading secure payment form...
          </Typography>
        </Box>
      )}

      {/* Square card container — NO React children, managed by Square SDK only */}
      <div
        ref={cardContainerRef}
        style={{ minHeight: cardReady ? undefined : '0px', marginBottom: '24px' }}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handleTokenize}
        disabled={!cardReady || isLoading}
        sx={{
          bgcolor: '#008d80', color: 'white', textTransform: 'none',
          fontFamily: '"Source Sans Pro", sans-serif', fontWeight: 700, fontSize: '1rem',
          py: 1.5, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,141,128,0.3)',
          '&:hover': { bgcolor: '#007067', boxShadow: '0 6px 24px rgba(0,141,128,0.4)' },
          '&.Mui-disabled': { bgcolor: '#ccc', color: 'white' },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={20} sx={{ color: 'white' }} />
            <span>Saving your card securely...</span>
          </Box>
        ) : (
          'Save Card for No-Show Protection'
        )}
      </Button>
    </Box>
  );
}
