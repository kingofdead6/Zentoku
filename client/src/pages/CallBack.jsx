// src/pages/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      // Use getSessionFromUrl to extract the session from the URL after redirect
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login'); // back to login on error
        return;
      }

      if (data?.session) {
        // store user info locally
        const user = data.session.user;
        sessionStorage.setItem('email', user.email);
        sessionStorage.setItem('userId', user.id);

        navigate('/anime'); // redirect after login
      }
    };

    handleGoogleAuth();
  }, [navigate]);

  return <p>Signing you in...</p>;
}
