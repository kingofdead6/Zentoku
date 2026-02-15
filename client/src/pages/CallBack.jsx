// src/pages/AuthCallback.jsx
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
        // v2 method to get session from URL after OAuth redirect
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (error) {
          console.error('Error getting session from URL:', error.message);
          return;
        }

        if (data.session) {
          const token = data.session.access_token;
          const result = await googleLogin(token);

          if (result.success) {
            navigate('/anime');
          } else {
            console.error(result.error);
          }
        }
      } catch (err) {
        console.error('Unexpected error in Google callback:', err);
      }
    };

    handleGoogleAuth();
  }, []);

  return <p>Signing you in...</p>;
}
