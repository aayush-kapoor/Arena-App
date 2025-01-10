import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg border hover:bg-gray-50 transition-colors"
    >
      <LogIn className="w-5 h-5 mr-2" />
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}