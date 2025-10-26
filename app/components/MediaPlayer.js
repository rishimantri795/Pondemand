'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Box, LinearProgress, Typography } from '@mui/material';
import { PlayCircle as PlayCircleIcon, PauseCircle as PauseCircleIcon } from '@mui/icons-material';

const AudioPlayer = ({ audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setTimeout(() => setIsPlaying(!isPlaying), 100);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
      setIsPlaying(audioRef.current.paused);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      setProgress((currentTime / duration) * 100 || 0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: '0 auto',
        padding: 2,
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative',  // Ensuring the controls are centered
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          color: '#9b59b6',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        Now Playing
      </Typography>

      {/* Audio Controls */}
      <audio ref={audioRef} src={audioSrc} />

      {/* Play / Pause Button */}
      <Box sx={{ textAlign: 'center', marginBottom: '16px' }}>
        <Button
          onClick={togglePlayPause}
          sx={{
            backgroundColor: '#9b59b6',
            color: 'white',
            borderRadius: '50%',
            padding: '16px',
            fontSize: '20px',
            '&:hover': {
              backgroundColor: '#6a4fb2',
            },
          }}
        >
          {isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />}
        </Button>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        sx={{
          marginTop: 2,
          marginBottom: 2,
          borderRadius: '12px',
          backgroundColor: '#e5e7eb',  // Light background for the progress bar
        }}
        variant="determinate"
        value={progress}
        color="secondary"
      />

      {/* Progress Percentage */}
      <Typography
        variant="body2"
        sx={{
          color: '#333',
          textAlign: 'center',
        }}
      >
        {Math.round(progress)}% Completed
      </Typography>
    </Box>
  );
};

export default AudioPlayer;
