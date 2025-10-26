'use client';

import React from 'react';
import { useMediaQuery, Typography, Box, Paper, LinearProgress, CircularProgress, Backdrop } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Refresh, AccessTime, CloudUpload } from '@mui/icons-material';

const SimpleLoadingScreen = ({ isFinished = false, onSuccess }) => {
  // Detect mobile devices (width ≤600px)
  const isMobile = useMediaQuery('(max-width:600px)');
  const [progressPercent, setProgressPercent] = React.useState(0);
  
  React.useEffect(() => {
    if (!isFinished) {
      const interval = setInterval(() => {
        setProgressPercent(prev => {
          // Cap at 95% until actually finished
          return prev < 95 ? prev + 1 : prev;
        });
      }, 600);
      
      return () => clearInterval(interval);
    } else {
      setProgressPercent(100);
    }
  }, [isFinished]);

  // Animation variants for the status items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Overlay animation
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Content animation
  const contentVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4,
        delay: 0.1,
        ease: "easeOut" 
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <motion.div variants={contentVariants}>
          <Paper
            elevation={5}
            sx={{
              maxWidth: '800px',
              width: '100%',
              padding: isMobile ? '20px' : '30px',
              borderRadius: '16px',
              backgroundColor: 'rgba(42, 42, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4a90e2 0%, #357ABD 100%)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CircularProgress 
                size={32} 
                thickness={4} 
                sx={{ color: '#4a90e2' }} 
              />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  color: 'white',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}
              >
                {isFinished ? "Processing Complete" : "Processing Your Podcast"}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', fontSize: '0.9rem' }}>
                  {isFinished ? "Complete" : "In Progress..."}
                </Typography>
                <Typography sx={{ color: '#4a90e2', fontWeight: '600', fontSize: '0.9rem' }}>
                  {`${progressPercent}%`}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressPercent} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4a90e2',
                    borderRadius: 4,
                  }
                }} 
              />
            </Box>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Process stages with status icons */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    padding: '12px 16px',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(74, 144, 226, 0.2)'
                  }}>
                    <CloudUpload sx={{ color: '#4a90e2' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'white', fontWeight: '500', fontSize: '0.95rem' }}>
                        Initializing Content Generation
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                        Processing your topic and preparing for creation
                      </Typography>
                    </Box>
                    <Check sx={{ color: '#4CAF50' }} />
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Refresh sx={{ color: progressPercent > 40 ? '#4a90e2' : 'rgba(255, 255, 255, 0.5)' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ 
                        color: progressPercent > 40 ? 'white' : 'rgba(255, 255, 255, 0.6)', 
                        fontWeight: '500', 
                        fontSize: '0.95rem' 
                      }}>
                        Generating Conversation
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                        Creating natural dialogue between hosts
                      </Typography>
                    </Box>
                    {progressPercent > 70 ? (
                      <Check sx={{ color: '#4CAF50' }} />
                    ) : progressPercent > 40 ? (
                      <CircularProgress size={20} thickness={4} sx={{ color: '#4a90e2' }} />
                    ) : (
                      <AccessTime sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    )}
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Refresh sx={{ color: progressPercent > 70 ? '#4a90e2' : 'rgba(255, 255, 255, 0.5)' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ 
                        color: progressPercent > 70 ? 'white' : 'rgba(255, 255, 255, 0.6)', 
                        fontWeight: '500', 
                        fontSize: '0.95rem' 
                      }}>
                        Processing Audio
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                        Synthesizing high-quality voice audio
                      </Typography>
                    </Box>
                    {progressPercent > 95 ? (
                      <Check sx={{ color: '#4CAF50' }} />
                    ) : progressPercent > 70 ? (
                      <CircularProgress size={20} thickness={4} sx={{ color: '#4a90e2' }} />
                    ) : (
                      <AccessTime sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    )}
                  </Box>
                </motion.div>
              </Box>
            </motion.div>

            {isFinished && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Box sx={{ 
                  mt: 4, 
                  p: 3, 
                  borderRadius: '12px',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center'
                }}>
                  <Check sx={{ color: '#4CAF50', fontSize: 28 }} />
                  <Box>
                    <Typography sx={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                      Podcast Created Successfully
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                      Your podcast is now available in your library
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            )}

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                mt: 4,
                textAlign: 'center',
                fontSize: '0.8rem'
              }}
            >
              {isFinished 
                ? "You can now listen to your conversation in the library." 
                : "This process typically takes 2-3 minutes to complete."}
            </Typography>
          </Paper>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimpleLoadingScreen;