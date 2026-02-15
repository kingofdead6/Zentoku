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
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const token = data.session.access_token;

        const result = await googleLogin(token);

        if (result.success) {
          navigate('/anime');
        } else {
          console.error(result.error);
        }
      }
    };

    handleGoogleAuth();
  }, []);

  return <p>Signing you in...</p>;
}
