import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    handleGoogleLogin();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/games`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: true // Add this line
        }
      });
      
      if (error) throw error;

      // Add this block to handle the redirect manually
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/games');
          authListener?.subscription.unsubscribe();
        }
      });
    } catch (error) {
      toast.error('Failed to sign in with Google');
      console.error('Error:', error);
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}