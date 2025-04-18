import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import supabase from './supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get the initial session
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(currentSession);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch session'));
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, error };
} 