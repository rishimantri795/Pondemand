'use client';

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { Button, Typography } from '@mui/material';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const redirectUri = "https://pondemand-b26dced7fb8b.herokuapp.com/googleauth";
const scope = encodeURIComponent("email profile openid");
const responseType = "code";

const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

const GoogleLoginButton = ({ onSuccess }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const res = await fetch('https://pondemand-b26dced7fb8b.herokuapp.com/googleauth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: codeResponse.code }),
        });

        if (!res.ok) {
          throw new Error('Failed to authenticate with the server');
        }

        const data = await res.json();
        localStorage.setItem('sessionToken', data.session_token);
        setUser(data.user);
        setError(null);
        onSuccess(data.user.id, data.user.name);
      } catch (err) {
        setError(err.message);
      }
    },
    flow: 'auth-code',
  });

  const handleLogin = () => {
    setError(null);
    login();
  };

  // Use a custom style object for the button that follows your theme:
  const buttonStyle = {
    backgroundColor: '#2A2A2A', // Dark gray background
    color: '#4a90e2',          // Blue text
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: 'none',
    textTransform: 'none',
    width: 'fit-content',
    '&:hover': {
      backgroundColor: '#1A1A1A',
      color: '#4a90e2',
      boxShadow: 'none',
    },
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {user ? (
        <div>
          <Typography variant="body1" sx={{ color: '#fff', marginBottom: '8px' }}>
            Welcome, {user.name}!
          </Typography>
          <Button onClick={() => setUser(null)} sx={buttonStyle}>
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={handleLogin} sx={buttonStyle}>
          Sign in with Google
        </Button>
      )}
      {error && <Typography variant="body2" sx={{ color: 'red' }}>{error}</Typography>}
    </div>
  );
};

export default GoogleLoginButton;