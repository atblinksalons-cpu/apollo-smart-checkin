import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { PatientWithSession } from '../lib/types';

export function useRealtimeTracking() {
  const [patients, setPatients] = useState<PatientWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPatients = useCallback(async () => {
    // Daily reset: only fetch patients with today's appointments
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const { data, error } = await supabase
      .from('patients')
      .select('*, tracking_sessions(*)')
      .gte('appointment_time', startOfDay)
      .lt('appointment_time', endOfDay)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    // Sort tracking_sessions within each patient so the latest session is first
    const processed = (data || []).map(p => ({
      ...p,
      tracking_sessions: (p.tracking_sessions || []).sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));

    setPatients(processed);
    setLoading(false);
  }, []);

  // Debounced fetch — coalesce rapid realtime events into one refetch
  const debouncedFetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPatients();
    }, 300);
  }, [fetchPatients]);

  useEffect(() => {
    fetchPatients();

    // Subscribe to realtime changes on both tables
    const channel = supabase
      .channel('tracking-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracking_sessions' },
        () => {
          debouncedFetch();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        () => {
          debouncedFetch();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] subscription status:', status);
      });

    // Also poll every 5 seconds as a fallback for reliability
    const pollInterval = setInterval(fetchPatients, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchPatients, debouncedFetch]);

  // Get the latest session for a patient
  const getLatestSession = (p: PatientWithSession) => {
    return p.tracking_sessions?.[0];
  };

  // Tracking On: patients who have shared location (location_shared or arriving)
  const trackingOn = patients.filter(p => {
    const session = getLatestSession(p);
    return session?.status === 'location_shared' || session?.status === 'arriving';
  });

  // Tracking Off: scheduled patients (no location permission yet)
  const trackingOff = patients.filter(p => {
    const session = getLatestSession(p);
    return !session || session.status === 'scheduled';
  });

  // Arrived: patients at the hospital
  const arrived = patients.filter(p => {
    const session = getLatestSession(p);
    return session?.status === 'arrived';
  });

  return {
    patients,
    trackingOn,
    trackingOff,
    arrived,
    loading,
    refetch: fetchPatients,
  };
}
