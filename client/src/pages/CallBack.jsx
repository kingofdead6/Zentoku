import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.access_token) {
              const token = session.access_token;

              const result = await googleLogin(token);

              if (result.success) {
                navigate('/anime');
              } else {
                console.error('Google login failed:', result.error);
              }
            }
          }
        );

        // Clean up subscription when component unmounts
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Unexpected error in Google callback:', err);
      }
    };

    handleGoogleAuth();
  }, [googleLogin, navigate]);

  return <p className="text-white text-center mt-40">Signing you in...</p>;
}
