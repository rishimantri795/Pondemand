'use client';

import React, { useState, useEffect } from 'react';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

const CustomWelcome = ({ username }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);
  

  return (
    <Fade in={fadeIn} timeout={2000}>
      <Typography
        variant="h3"
        sx={{
          textAlign: 'center',
          marginBottom: '15px',
          marginTop: '50px',
          color: '#FFFFFF',
          // fontWeight: 'bold',
          fontSize: '2rem',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          backgroundColor: 'transparent',
        }}
      >
        {username ? `${username}'s Media Library` : 'Welcome to Your Media Library'}
      </Typography>
    </Fade>
  );
};

export default CustomWelcome;