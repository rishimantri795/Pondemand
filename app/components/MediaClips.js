'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
// const Plyr = dynamic(() => import('plyr-react'), { ssr: false });
// import 'plyr-react/plyr.css';

import PlyrPlayer from './PlyrPlayer'; // Import the PlyrPlayer component
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  IconButton,
  Fade,
  Modal,
  Button,
  Select,
  MenuItem,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SmsIcon from '@mui/icons-material/Sms';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import RedditIcon from '@mui/icons-material/Reddit';
// Removed TwitterIcon; we'll use a custom XIcon instead.
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import HearingRoundedIcon from '@mui/icons-material/HearingRounded';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import { usePathname, useSearchParams } from 'next/navigation';
import 'react-tabs/style/react-tabs.css';

import Switch from 'react-switch';
import { motion } from 'framer-motion';
import SimpleLoadingScreen from './LoadingScreen';
import { line, path } from 'framer-motion/client';

// Custom XIcon to represent X's logo.
// Set to white so it stands out on a dark background.
const XIcon = (props) => (
  <svg 
    {...props} 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    fill="currentColor"
    style={{ 
      minWidth: '24px', 
      minHeight: '24px',
      ...props.style 
    }}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const fadeInAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const MediaClips = ({ userId, refreshKey = 0 }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [audioUrls, setAudioUrls] = useState({});
  const [fadeIn, setFadeIn] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const playerInitTimeoutRef = useRef(null);
  const playerCheckIntervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);


  const isMobile = useMediaQuery('(max-width:600px)');
  const initialVisibleCards = isMobile ? 5 : 6;
  const [visibleCardsCount, setVisibleCardsCount] = useState(initialVisibleCards);

  const [audioBarOpen, setAudioBarOpen] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  // const [listened, setListened] = useState({});
  // const [filterOption, setFilterOption] = useState('recently_uploaded');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Share modal state (only on Discover pages)
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareAudioId, setShareAudioId] = useState(null);
  // We'll use a scrollable container ref for continuous scrolling.
  const shareIconsRef = useRef(null);
  // Add state for copy notification
  const [copyNotification, setCopyNotification] = useState(false);

  // For both Library and Discover pages, use minimal padding.
  const containerPadding =
    pathname === '/library' || pathname === '/main'
      ? '10px 10px'
      : '40px 10px';

  const plyrRef = useRef(null);
  const containerRef = useRef(null);

  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [currentSourceLinks, setCurrentSourceLinks] = useState(null);

  useEffect(() => {
    setVisibleCardsCount(isMobile ? 5 : 6);
  }, [isMobile]);

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openModal]);

  useEffect(() => {
    if (audioBarOpen) {
      document.body.style.overflow = 'unset';
    }
  }, [audioBarOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Ensure the body overflow is set to 'unset' whenever a new audio file is played
  useEffect(() => {
    if (currentAudioId) {
      document.body.style.overflow = 'unset';
    }
  }, [currentAudioId]);

    
  

  const properCase = (str) => {
    const exceptions = [
      'a',
      'an',
      'the',
      'and',
      'but',
      'or',
      'for',
      'nor',
      'on',
      'at',
      'to',
      'by',
      'from',
      'as',
      'with',
      'about',
      'of',
    ];
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) =>
        index === 0 || !exceptions.includes(word.toLowerCase())
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      )
      .join(' ');
  };

  // Helper function to render transcript with bolded names.
  const renderTranscript = (text) => {
    const regex = /(\b[^:\n]+:\s)/g;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (/^[^:\n]+:\s$/.test(part)) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  const fetchAudioUrl = async (audioId, audioPath) => {
    try {
      const s3Response = await axios.get(
        `https://pondemand-b26dced7fb8b.herokuapp.com/${audioPath}`
      );
      setAudioUrls((prev) => ({
        ...prev,
        [audioId]: s3Response.data['url'],
      }));
    } catch (error) {
      console.error('Error fetching audio URL:', error);
    }
  };

  const addAudiotoShare = async (audioId) => {
    try {
      console.log('Adding audio to share:', audioId);
      console.log('User ID:', userId);
      const response = await axios.post(
        'https://pondemand-b26dced7fb8b.herokuapp.com/add_audio_to_share',
        {
          audioId,
          userId
        }
      );
      console.log('Audio added to share:', response.data);
    } catch (error) {
      console.error('Error adding audio to share:', error);
    }
  };

  // Helper function to safely interact with player
  const safePlayerOperation = async (operation) => {
    if (!plyrRef.current?.plyr) return false;
    try {
      await operation(plyrRef.current.plyr);
      return true;
    } catch (error) {
      console.debug('Player operation failed:', error);
      return false;
    }
  };

  // Helper function to check if player is ready
  const isPlayerReady = (player) => {
    return (
      player.ready ||
      (player.media && player.media.readyState >= 2) ||
      (player.media && typeof player.media.play === 'function' && player.duration > 0) ||
      (player.media && player.media.duration > 0)
    );
  };

  const openAudioModal = async (audioId) => {
    if (currentAudioId !== audioId) {
      // Cleanup previous player
      if (currentAudioId && plyrRef.current?.plyr) {
        await safePlayerOperation(async (player) => {
          setCurrentTime(player.currentTime || 0);
          if (typeof player.pause === 'function') {
            await player.pause();
          }
        });
      }

      // Reset states for new audio
      setCurrentTime(0);
      setIsPlaying(true);
      setPlayerReady(false);
      setPlayerError(null);
      setCurrentAudioId(audioId);
      setAudioBarOpen(true);
      setOpenModal(true);

      // Clear any existing timeouts/intervals
      if (playerInitTimeoutRef.current) {
        clearTimeout(playerInitTimeoutRef.current);
      }
      if (playerCheckIntervalRef.current) {
        clearInterval(playerCheckIntervalRef.current);
      }
    } else {
      setOpenModal(true);
      setAudioBarOpen(true);
    }
  };

  const downloadAudio = async (audioId) => {
    try {
      const url = audioUrls[audioId];
      const a = document.createElement('a');
      a.href = url;
      a.download = audioId + '.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  const handleModalClose = (event, reason) => {
    if (reason === 'backdropClick') {
      return;
    }
    setOpenModal(false);
  };

  // Effect to handle player initialization and cleanup
  useEffect(() => {
    let mounted = true;
    let initTimeout = null;
    let checkInterval = null;

    const initializePlayer = async () => {
      if (!plyrRef.current?.plyr || !mounted) return;

      const player = plyrRef.current.plyr;

      // Setup player event handlers
      const handleReady = () => {
        if (mounted) {
          setPlayerReady(true);
          setPlayerError(null);
          // Always try to play when ready if we're supposed to be playing
          if (isPlaying) {
            setTimeout(() => {
              safePlayerOperation(async (p) => {
                if (p.media && document.contains(p.media)) {
                  try {
                    await p.play();
                  } catch (error) {
                    console.debug('Error during initial play:', error);
                    setIsPlaying(false);
                  }
                }
              });
            }, 100); // Small delay to ensure everything is ready
          }
        }
      };

      const handleError = (error) => {
        if (mounted) {
          console.debug('Player error:', error);
          setPlayerError(error);
          setIsPlaying(false);
        }
      };

      // Clear previous timeouts/intervals
      if (initTimeout) clearTimeout(initTimeout);
      if (checkInterval) clearInterval(checkInterval);

      // Start checking player readiness
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total

      const checkPlayerStatus = () => {
        if (!mounted) return;

        attempts++;
      
        
        if (isPlayerReady(player)) {
          handleReady();
          if (checkInterval) clearInterval(checkInterval);
          return;
        }

        if (attempts >= maxAttempts) {
          if (player.media && typeof player.media.play === 'function') {
            console.warn('Player ready check timed out, but media appears playable');
            handleReady();
          } else {
            handleError('Player initialization timeout');
          }
          if (checkInterval) clearInterval(checkInterval);
        }
      };

      // Start periodic checks
      checkInterval = setInterval(checkPlayerStatus, 100);
      playerCheckIntervalRef.current = checkInterval;

      // Set timeout for overall initialization
      initTimeout = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        if (!playerReady && mounted) {
          handleError('Player initialization timeout');
        }
      }, 5000);
      playerInitTimeoutRef.current = initTimeout;

      // Cleanup function
      return () => {
        if (initTimeout) clearTimeout(initTimeout);
        if (checkInterval) clearInterval(checkInterval);
      };
    };

    initializePlayer();

    return () => {
      mounted = false;
      if (playerInitTimeoutRef.current) {
        clearTimeout(playerInitTimeoutRef.current);
      }
      if (playerCheckIntervalRef.current) {
        clearInterval(playerCheckIntervalRef.current);
      }
    };
  }, [plyrRef.current?.plyr, currentAudioId]);

  // Effect to handle playback state changes
  useEffect(() => {
    if (!plyrRef.current?.plyr || !playerReady) return;

    safePlayerOperation(async (player) => {
      if (isPlaying && player.media && document.contains(player.media)) {
        try {
          await player.play();
        } catch (error) {
          console.debug('Error playing audio:', error);
          setIsPlaying(false);
        }
      } else if (!isPlaying && player.media) {
        try {
          await player.pause();
        } catch (error) {
          console.debug('Error pausing audio:', error);
        }
      }
    });
  }, [isPlaying, playerReady]);

  // Update skip functions to use safePlayerOperation
  const skipBackward = async () => {
    await safePlayerOperation(async (player) => {
      const wasPlaying = !player.paused;
      if (wasPlaying) {
        await player.pause();
      }
      const newTime = Math.max(0, player.currentTime - 10);
      player.currentTime = newTime;
      if (wasPlaying) {
        await player.play();
      }
    });
  };

  const skipForward = async () => {
    await safePlayerOperation(async (player) => {
      const wasPlaying = !player.paused;
      if (wasPlaying) {
        await player.pause();
      }
      const newTime = Math.min(player.duration, player.currentTime + 10);
      player.currentTime = newTime;
      if (wasPlaying) {
        await player.play();
      }
    });
  };

  // Update plyrOptions to include error handling
  const plyrOptions = useMemo(() => ({
    controls: isMobile
      ? ['rewind', 'play', 'fast-forward', 'progress', 'settings']
      : ['rewind', 'play', 'fast-forward', 'progress', 'current-time', 'mute', 'volume', 'settings'],
    settings: ['speed'],
    autoplay: false, // We'll handle playback manually
    resetOnEnd: false,
    debug: true
  }), [isMobile]);

  // Fetch audio files on mount/update.
  useEffect(() => {
    const endpoint =
      userId === 0
        ? 'https://pondemand-b26dced7fb8b.herokuapp.com/get_audio_files'
        : `https://pondemand-b26dced7fb8b.herokuapp.com/get_user_audio_files/${userId}`;

    axios
      .get(endpoint)
      .then((response) => {
        setAudioFiles(response.data);
        response.data.forEach((file) => {
          fetchAudioUrl(file.id, file.path);
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching audio files:', error);
        setIsLoading(false);
      });

    setFadeIn(true);
  }, [refreshKey, userId]);

  const loadMoreCards = () => {
    setVisibleCardsCount((prevCount) => prevCount + (isMobile ? 5 : 9));
  };

  const collapseCards = () => {
    setVisibleCardsCount(isMobile ? 5 : 6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentAudioId && plyrRef.current && plyrRef.current.plyr) {
      try {
        const player = plyrRef.current.plyr;
        if (player.media && typeof player.media.play === 'function') {
          player.media.play().catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Play() aborted because media was removed.');
            } else {
              console.error('Error playing audio:', error);
            }
          });
        }
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    }
  }, [currentAudioId]);

  useEffect(() => {
    if (plyrRef.current && plyrRef.current.plyr) {
      plyrRef.current.plyr.speed = playbackSpeed;
    }
  }, [playbackSpeed]);

  // let filteredAudioFiles = audioFiles;
  // if (filterOption === 'listened') {
  //   filteredAudioFiles = audioFiles.filter((file) => listened[file.id]);
  // } else if (filterOption === 'not_listened') {
  //   filteredAudioFiles = audioFiles.filter((file) => !listened[file.id]);
  // } else if (filterOption === 'recently_uploaded') {
  //   filteredAudioFiles = [...audioFiles].sort(
  //     (a, b) => new Date(b.created_at) - new Date(a.created_at)
  //   );
  // }

  const plyrSource = useMemo(() => {
    return audioUrls[currentAudioId]
      ? {
          type: 'audio',
          sources: [
            {
              src: audioUrls[currentAudioId],
              provider: 'html5',
            },
          ],
        }
      : null;
  }, [audioUrls, currentAudioId]);

  const navLinkStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    fontWeight: 'bold',
    textDecoration: 'none',
    padding: '8px 16px',
    textTransform: 'none',
    transition: 'color 0.3s',
    fontSize: '1.1rem',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  };

  const customButtonStyle = {
    backgroundColor: '#2A2A2A',
    color: '#4a90e2',
    fontWeight: 'bold',
    borderRadius: '8px',
    padding: '8px 16px',
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'background-color 0.3s, color 0.3s',
    '&:hover': {
      backgroundColor: '#1A1A1A',
      color: '#4a90e2',
      boxShadow: 'none',
    },
    fontFamily: "'Outfit', 'Inter', sans-serif",

  };

  const audioBarSx = {
    position: 'fixed',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2a2a2a',
    padding: isMobile ? '10px 12px' : '12px 20px',
    zIndex: 1500,
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 0.5 : 1.5,
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    width: '95%',
    maxWidth: '1000px',
    pointerEvents: 'auto',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const trackerGroupSx = {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    '& button[data-plyr="rewind"]': { marginRight: '8px' },
    '& button[data-plyr="fast-forward"]': { marginLeft: '4px' },
  };

  const plyrBoxSx = {
    flex: 1,
  };

  // Function to open the share modal and store the audioId.
  const openShareModal = async (audioId) => {
    if (pathname === '/library') {
      await addAudiotoShare(audioId);
    }
    setShareAudioId(audioId);
    setShareModalOpen(true);
  };

  

  // On Discover page only, if the URL contains an "audioId" query parameter, open that modal.
  useEffect(() => {
    
      const audioIdFromUrl = searchParams.get('audioId');
      if (audioIdFromUrl && audioIdFromUrl !== currentAudioId) {
        openAudioModal(audioIdFromUrl);
      }
    
  }, [pathname, searchParams, audioFiles]);

  // Compute shareable link using shareAudioId.


  const shareLink = 
  shareAudioId && typeof window !== 'undefined'
    ? window.location.pathname === '/library'
      ? `${window.location.origin}/shared?audioId=${shareAudioId}`
      : `${window.location.origin}/main?audioId=${shareAudioId}`
    : '';
  // Update shareOptions with proper icon sizes, branding colors, and updated link for X.
  const shareOptions = [
    {
      name: 'Mail',
      icon: <MailOutlineIcon sx={{ fontSize: '20px', color: '#D44638' }} />,
      onClick: () =>
        window.open(`mailto:?subject=Check out this audio clip&body=${shareLink}`, '_blank'),
    },
    {
      name: 'SMS',
      icon: <SmsIcon sx={{ fontSize: '20px', color: '#4CAF50' }} />,
      onClick: () => window.open(`sms:?&body=${encodeURIComponent(shareLink)}`, '_blank'),
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon sx={{ fontSize: '20px', color: '#25D366' }} />,
      onClick: () =>
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`, '_blank'),
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon sx={{ fontSize: '20px', color: '#1877F2' }} />,
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
          '_blank'
        ),
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon sx={{ fontSize: '20px', color: '#0077B5' }} />,
      onClick: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
          '_blank'
        ),
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon sx={{ fontSize: '20px', color: '#E4405F' }} />,
      onClick: () => {
        navigator.clipboard.writeText(shareLink).then(() => {
          alert('Link copied! Please share it on Instagram.');
        });
      },
    },
    {
      name: 'Reddit',
      icon: <RedditIcon sx={{ fontSize: '20px', color: '#FF5700' }} />,
      onClick: () =>
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareLink)}`, '_blank'),
    },
    {
      name: 'X',
      icon: (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '4px', 
          width: '20px', 
          height: '20px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <XIcon style={{ color: 'black', width: '14px', height: '14px' }} />
        </div>
      ),
      onClick: () =>
        window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(shareLink)}`, '_blank'),
    },
  ];

  // Function for continuous scroll of share icons.
  const scrollShareIcons = (direction) => {
    if (shareIconsRef.current) {
      shareIconsRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  // Add this function to handle opening the source modal
  const openSourceModal = (source) => {
    setCurrentSourceLinks(source);
    setSourceModalOpen(true);
  };

  // Update the renderSourceLinks function with more professional styling
  const renderSourceLinks = (source) => {
    if (!source || source === 'notNews') {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 2, 
          color: '#9e9e9e',
          fontFamily: "'Outfit', 'Inter', sans-serif",
        }}>
          No source information available for this content.
        </Box>
      );
    }

    const links = Array.isArray(source) ? source : [source];
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {links.map((link, index) => {
          // Extract domain name for the title if no other title is available
          const url = new URL(link);
          const domain = url.hostname.replace('www.', '');
          const title = `Article from ${domain}`;
          
          return (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(74, 144, 226, 0.1)', 
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                  mt: 0.5
                }}
              >
                <Typography 
                  sx={{ 
                    color: '#4a90e2', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold'
                  }}
                >
                  {index + 1}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  sx={{ 
                    color: '#e0e0e0', 
                    fontSize: '0.9rem', 
                    mb: 0.5,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  {title}
                </Typography>
                
                <Typography 
                  sx={{ 
                    color: '#9e9e9e', 
                    fontSize: '0.8rem',
                    mb: 1,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  {domain}
                </Typography>
                
                <Button
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  sx={{
                    color: '#4a90e2',
                    borderColor: 'rgba(74, 144, 226, 0.3)',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: 'rgba(74, 144, 226, 0.05)',
                      borderColor: '#4a90e2',
                    },
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  Visit Source
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          background: '#1A1A1A',
          padding: containerPadding,
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
          paddingBottom: pathname === '/library' ? '100px' : '80px',
          paddingTop: pathname === '/library' ? '40px' : '0px',
          fontFamily: "'Outfit', 'Inter', sans-serif",
        }}
      >
        <Container maxWidth="lg">
          {pathname === '/main' ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  position: 'relative',
                  mb: 6,
                  mt: 5, 
                  paddingY: 2,
                }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFFFFF',
                      fontSize: { xs: '1.7rem', md: '2.2rem' },
                      fontWeight: 600,
                      mb: 1,
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Featured Discussions
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1rem',
                      maxWidth: '700px',
                      margin: '0 auto',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Explore the latest content from top sources, processed and ready for you to listen
                  </Typography>
                </Box>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: 4,
                mt: 0,
                mx: { xs: 0, md: 2 }
              }}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFFFFF',
                      fontSize: { xs: '1.5rem', md: '1.8rem' },
                      fontWeight: 600,
                      mb: 1,
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Your Library
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    {audioFiles.length} items in your collection
                  </Typography>
                </Box>
                </Box>
            </motion.div>
          )}

          <Box 
            sx={{ 
              position: 'relative', 
              mb: 4,
              mx: { xs: 0, md: 1 }
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: { xs: 3, md: 4 },
              }}
            >
              {audioFiles.slice(0, visibleCardsCount).map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      backgroundColor: 'rgba(35, 35, 35, 0.6)',
                      borderRadius: '16px',
                      height: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        transform: pathname === '/library' ? 'translateY(-5px)' : 'scale(1.02)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                        borderColor: 'rgba(74, 144, 226, 0.3)',
                        '& .play-button': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                        '& .card-header': {
                          backgroundColor: 'rgba(74, 144, 226, 0.15)',
                        },
                      },
                    }}
                  >
                    <Box 
                      className="card-header"
                      sx={{ 
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          sx={{ 
                            height: '36px',
                            width: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #4a90e2, #357ABD)',
                          }}
                        >
                          <HearingRoundedIcon sx={{ color: '#fff', fontSize: '18px' }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#9e9e9e',
                              fontSize: '0.7rem',
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                              display: 'block',
                            }}
                          >
                            {file.length ? `${file.length} min audio` : "Audio"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#4a90e2',
                              fontSize: '0.7rem',
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                              fontWeight: 500,
                            }}
                          >
                            {file.created_at ? new Date(file.created_at).toLocaleDateString() : ""}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={() => openSourceModal(file.source)}
                          size="small"
                          sx={{
                            color: '#9e9e9e',
                            width: '28px',
                            height: '28px',
                            '&:hover': {
                              color: '#4a90e2',
                            },
                          }}
                        >
                          <InfoIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        
                        <IconButton
                          onClick={() => downloadAudio(file.id)}
                          size="small"
                          sx={{
                            color: '#9e9e9e',
                            width: '28px',
                            height: '28px',
                            '&:hover': {
                              color: '#4a90e2',
                            },
                          }}
                        >
                          <CloudDownloadIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        
                        <IconButton
                          onClick={() => openShareModal(file.id)}
                          size="small"
                          sx={{
                            color: '#9e9e9e',
                            width: '28px',
                            height: '28px',
                            '&:hover': {
                              color: '#4a90e2',
                            },
                          }}
                        >
                          <ShareIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        p: '12px 16px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >    
                      {/* Static decorative background elements */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '-10px',
                          right: '-20px',
                          width: '180px',
                          height: '180px',
                          borderRadius: '50%',
                          background: `radial-gradient(circle, rgba(74, 144, 226, 0.04) 0%, rgba(74, 144, 226, 0) 70%)`,
                          zIndex: 1,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '20px',
                          right: '-80px',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: `radial-gradient(circle, rgba(74, 144, 226, 0.03) 0%, rgba(74, 144, 226, 0) 70%)`,
                          zIndex: 1,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '40px',
                          left: '-30px',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: `radial-gradient(circle, rgba(74, 144, 226, 0.02) 0%, rgba(74, 144, 226, 0) 70%)`,
                          zIndex: 1,
                        }}
                      />
                      {/* Audio dots pattern */}
                      <Box
                        className="audio-bars"
                        sx={{
                          position: 'absolute',
                          bottom: '20px',
                          right: '20px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '3px',
                          height: '25px',
                          opacity: 0.4,
                          zIndex: 1,
                        }}
                      >
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Box
                            key={i}
                            className={`audio-bar audio-bar-${i}`}
                            sx={{
                              width: '3px',
                              height: `${[8, 16, 10, 14, 12][i]}px`,
                              backgroundColor: 'rgba(74, 144, 226, 0.7)',
                              borderRadius: '4px',
                            }}
                          />
                        ))}
                      </Box>
                              
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          letterSpacing: '0.01em',
                          mb: 1.5,
                          fontFamily: "'Outfit', 'Inter', sans-serif",
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        {file.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem',
                          flex: 1,
                          fontFamily: "'Outfit', 'Inter', sans-serif",
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        {file.description}
                      </Typography>

                      {audioUrls[file.id] && (
                        <Box 
                          sx={{ 
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            mt: 'auto',
                            position: 'relative',
                            zIndex: 2,
                          }}
                        >
                          <Button
                            onClick={() => openAudioModal(file.id)}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(74, 144, 226, 0.1)',
                              color: '#fff',
                              fontWeight: 500,
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                              textTransform: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(74, 144, 226, 0.3)',
                              fontSize: '0.8rem',
                              '&:hover': {
                                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                                borderColor: '#4a90e2',
                              },
                            }}
                          >
                            <PlayArrowIcon
                              sx={{
                                mr: 0.5,
                                fontSize: '1rem',
                              }}
                            />
                            Play
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
          
          {audioFiles.length > 0 ? (
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 3,
                pb: 1,
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  mb: { xs: 2, sm: 0 }
                }}
              >
                Showing {Math.min(visibleCardsCount, audioFiles.length)} of {audioFiles.length} items
              </Typography>
              
              {audioFiles.length > (isMobile ? 5 : 6) && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {visibleCardsCount >= audioFiles.length && (
                    <Button
                      onClick={collapseCards}
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: '#c4c4c4',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        fontWeight: 500,
                        borderRadius: '8px',
                              textTransform: 'none',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: '#fff',
                          color: '#fff'
                        },
                      }}
                    >
                      Collapse View
                    </Button>
                  )}
                  
                  {visibleCardsCount < audioFiles.length && (
                    <Button
                      onClick={loadMoreCards}
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(90deg, #4a90e2, #357ABD)',
                        color: 'white',
                              fontWeight: 500,
                        borderRadius: '8px',
                        textTransform: 'none',
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                        boxShadow: '0 4px 10px rgba(53, 122, 189, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #357ABD, #2A6DB0)',
                          boxShadow: '0 6px 15px rgba(53, 122, 189, 0.4)',
                        },
                      }}
                    >
                      Load More
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}>
              {isLoading ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <CircularProgress size={40} sx={{ color: '#4a90e2' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#9e9e9e',
                      mb: 1,
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Loading content...
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#7e7e7e',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Please wait while we fetch your media
                  </Typography>
                </>
              ) : (
                <>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#9e9e9e',
                      mb: 2,
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    No audio files found
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#7e7e7e',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Check back later or adjust your filters
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Container>

        {/* Updated Audio Bar with more professional design */}
        {plyrSource && audioBarOpen && (
          <Fade in={audioBarOpen} timeout={800}>
            <Box sx={audioBarSx}>
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '200px', mr: 2 }}>
                  <Box sx={{ 
                    width: '36px', 
                    height: '36px', 
                              borderRadius: '6px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    mr: 1.5
                  }}>
                    <HearingRoundedIcon sx={{ color: '#4a90e2', fontSize: '18px' }} />
                  </Box>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography 
                      sx={{ 
                        color: '#fff', 
                        fontWeight: 500, 
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '150px',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      {audioFiles.find(file => file.id === currentAudioId)?.title || 'Now Playing'}
                    </Typography>
                    <Typography 
                      sx={{ 
                        color: '#9e9e9e', 
                        fontSize: '0.75rem',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      {audioFiles.find(file => file.id === currentAudioId)?.length ? `${audioFiles.find(file => file.id === currentAudioId)?.length} min` : 'Audio'}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <Box sx={trackerGroupSx}>
                <Box sx={plyrBoxSx}>
                  
                  <Box
                  >
                    <PlyrPlayer
                      ref={plyrRef}
                      source={plyrSource}
                      options={plyrOptions}
                      style={{ width: '100%' }}
                    />
                  </Box>
                </Box>
              </Box>
              
              {!isMobile && (
                <Select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(e.target.value)}
                  size="small"
                  sx={{
                    minWidth: '90px',
                    fontSize: '0.75rem',
                    height: '32px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#c4c4c4',
                    borderRadius: '6px',
                    mr: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4a90e2',
                              },
                            }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: '#2a2a2a', color: '#fff' },
                    },
                  }}
                >
                  <MenuItem value={0.5}>0.5x</MenuItem>
                  <MenuItem value={0.75}>0.75x</MenuItem>
                  <MenuItem value={1}>1x</MenuItem>
                  <MenuItem value={1.25}>1.25x</MenuItem>
                  <MenuItem value={1.5}>1.5x</MenuItem>
                  <MenuItem value={2}>2x</MenuItem>
                </Select>
              )}
              
              <IconButton
                onClick={() => {
                  setAudioBarOpen(false);
                  if (plyrRef.current && plyrRef.current.plyr && plyrRef.current.plyr.media) {
                    plyrRef.current.plyr.media.pause();
                  }
                }}
                              sx={{
                  color: '#9e9e9e',
                  backgroundColor: 'transparent',
                  '&:hover': { color: '#fff', backgroundColor: 'transparent' },
                }}
              >
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>×</Typography>
              </IconButton>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Updated Transcript Modal with more professional design */}
      <Modal
        open={openModal}
        onClose={handleModalClose}
        closeAfterTransition
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '-10px',
          paddingBottom: '20px',
          overflow: 'auto'
        }}
      >
        <Fade in={openModal} timeout={800}>
          <Box
            sx={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              width: '95%',
              maxWidth: '1000px',
              maxHeight: 'calc(80vh - 40px)',
              position: 'relative',
              margin: '0 auto',
              marginBottom: '0',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 500, 
                                color: '#fff',
                  fontSize: '1.1rem',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                {audioFiles.find(file => file.id === currentAudioId)?.title || 'Transcript & Summary'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => setOpenModal(false)}
                  sx={{
                    color: '#9e9e9e',
                    backgroundColor: 'transparent',
                    padding: '6px',
                    '&:hover': { 
                      color: '#fff', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>×</Typography>
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 'calc(80vh - 40px)' }}>
              {/* Summary Panel */}
              <Box sx={{ 
                width: { xs: '100%', md: '280px' }, 
                borderRight: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.1)' },
                borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.1)', md: 'none' },
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Typography
                    sx={{ 
                      color: '#4a90e2', 
                      fontWeight: 500, 
                                fontSize: '1rem',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Summary
                  </Typography>
                </Box>
                
                <Typography
                  variant="body2"
                  sx={{ 
                    color: '#c4c4c4', 
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    overflowY: 'auto',
                    flex: 1,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  {audioFiles.find((file) => file.id === currentAudioId)?.summary ||
                    'No summary available for this audio.'}
                </Typography>
              </Box>
              
              {/* Transcript Panel */}
              <Box sx={{ 
                flex: 1, 
                p: 3, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Typography
                    sx={{ 
                      color: '#4a90e2', 
                      fontWeight: 500, 
                      fontSize: '1rem',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Transcript
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => downloadAudio(currentAudioId)}
                      size="small"
                      sx={{
                        color: '#c4c4c4',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: '6px',
                        '&:hover': {
                          color: '#4a90e2',
                          backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        },
                      }}
                    >
                      <CloudDownloadIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                    
                    <IconButton
                      onClick={() => openShareModal(currentAudioId)}
                      size="small"
                      sx={{
                        color: '#c4c4c4',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: '6px',
                        '&:hover': {
                          color: '#4a90e2',
                          backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        },
                      }}
                    >
                      <ShareIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                  p: 3, 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  height: 'auto',
                  maxHeight: 'calc(100% - 50px)',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {(() => {
                    const currentFile = audioFiles.find((file) => file.id === currentAudioId);
                    const transcriptText = currentFile?.transcript;
                    return (
                      <Typography
                        variant="body2"
                        sx={{ 
                          whiteSpace: 'pre-wrap', 
                          lineHeight: 1.7, 
                          color: '#e0e0e0',
                          fontSize: '0.9rem',
                          fontFamily: "'Outfit', 'Inter', sans-serif",
                          paddingBottom: '40px',
                          marginBottom: '20px',
                        }}
                      >
                        {transcriptText ? renderTranscript(transcriptText) : 'No transcript available for this audio.'}
                      </Typography>
                    );
                  })()}
                </Box>
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                p: 2, 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <Button
                onClick={() => setOpenModal(false)}
                sx={{
                  color: '#fff',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Share Modal */}
      <Modal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={shareModalOpen} timeout={800}>
          <Box
            sx={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              width: '95%',
              maxWidth: 450,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 500, 
                  color: '#fff', 
                  fontSize: '1.1rem',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Share Audio
              </Typography>
              
              <IconButton
                onClick={() => setShareModalOpen(false)}
                sx={{
                  color: '#9e9e9e',
                  backgroundColor: 'transparent',
                  padding: '6px',
                  '&:hover': { 
                    color: '#fff', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  },
                }}
              >
                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>×</Typography>
              </IconButton>
            </Box>
            
            <Box sx={{ p: 2.5 }}>
              <Typography 
                sx={{ 
                  color: '#c4c4c4', 
                  fontSize: '0.9rem', 
                  mb: 2.5,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Share this audio clip with others:
              </Typography>
              
              <Box sx={{ 
                maxWidth: '100%',
                overflow: 'hidden',
                position: 'relative' 
              }}>
                <Box 
                  ref={shareIconsRef}
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1.5,
                    justifyContent: 'center',
                    overflowX: 'auto',
                    py: 1,
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                    },
                  }}
                >
                  {shareOptions.map((option, index) => (
                    <Button
                      key={index}
                      onClick={option.onClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                        minWidth: '52px',
                        height: '52px',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      {option.icon}
                    </Button>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Typography 
                  sx={{ 
                    color: '#c4c4c4', 
                    fontSize: '0.85rem',
                    mb: 1.5,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  Or copy link:
                </Typography>
                
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}>
                  <Box sx={{ 
                    flex: 1,
                    p: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#9e9e9e',
                    fontSize: '0.85rem',
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}>
                    {shareLink}
                  </Box>
                  
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink).then(() => {
                        // Show copy notification
                        setCopyNotification(true);
                        // Hide notification after 2 seconds
                        setTimeout(() => {
                          setCopyNotification(false);
                        }, 2000);
                      });
                    }}
                    sx={{
                      backgroundColor: 'rgba(74, 144, 226, 0.1)',
                      color: '#4a90e2',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0',
                      padding: '8px 16px',
                      minWidth: 'auto',
                      height: '100%',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      '&:hover': {
                        backgroundColor: 'rgba(74, 144, 226, 0.2)',
                      }
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: '16px' }} />
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Copy notification */}
            {copyNotification && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(74, 144, 226, 0.9)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  zIndex: 5,
                  animation: 'fadeInOut 2s ease',
                  '@keyframes fadeInOut': {
                    '0%': { opacity: 0, transform: 'translate(-50%, 10px)' },
                    '15%': { opacity: 1, transform: 'translate(-50%, 0)' },
                    '85%': { opacity: 1, transform: 'translate(-50%, 0)' },
                    '100%': { opacity: 0, transform: 'translate(-50%, -10px)' },
                  },
                }}
              >
                Copied!
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Updated Source Modal with B2B focus */}
      <Modal
        open={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={sourceModalOpen} timeout={800}>
          <Box
            sx={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              width: '95%',
              maxWidth: 500,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 500, 
                  color: '#fff', 
                  fontSize: '1.1rem',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Source Information
              </Typography>
              
              <IconButton
                onClick={() => setSourceModalOpen(false)}
                sx={{
                  color: '#9e9e9e',
                  backgroundColor: 'transparent',
                  padding: '6px',
                  '&:hover': { 
                    color: '#fff', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  },
                }}
              >
                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>×</Typography>
              </IconButton>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography 
                sx={{ 
                  color: '#c4c4c4', 
                  fontSize: '0.9rem', 
                  mb: 3,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Below are the original sources for this content. Click on any link to view the full article.
              </Typography>
              
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  p: 2,
                  maxHeight: '50vh', 
                  overflowY: 'auto' 
                }}
              >
                {renderSourceLinks(currentSourceLinks)}
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                p: 2, 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <Button
                onClick={() => setSourceModalOpen(false)}
                sx={{
                  color: '#fff',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <style jsx global>{`
        .plyr,
        .plyr__controls,
        .plyr__audio {
          background-color: #2a2a2a !important;
          color: #fff !important;
        }
        
        .plyr__controls button {
          background-color: transparent !important;
          transition: color 0.3s;
        }
        .plyr__controls button:hover,
        .plyr__controls button:focus {
          background-color: transparent !important;
        }
        .plyr__controls button svg {
          transition: color 0.3s;
        }
        .plyr__controls button:hover svg,
        .plyr__controls button:focus svg {
          color: #4a90e2 !important;
        }
        @media (max-width: 600px) {
          .plyr__controls {
            font-size: 0.8rem;
          }
        }
        
        /* Audio visualization bars - static state */
        .audio-bars .audio-bar {
          transition: height 0.5s ease;
        }
        
        /* Audio visualization bars - hover animations */
        *:hover > .audio-bars .audio-bar-0 {
          animation: barAnimation1 1.2s ease-in-out infinite alternate;
        }
        
        *:hover > .audio-bars .audio-bar-1 {
          animation: barAnimation2 1.7s ease-in-out infinite alternate;
        }
        
        *:hover > .audio-bars .audio-bar-2 {
          animation: barAnimation3 1.4s ease-in-out infinite alternate;
        }
        
        *:hover > .audio-bars .audio-bar-3 {
          animation: barAnimation2 1.6s ease-in-out infinite alternate;
        }
        
        *:hover > .audio-bars .audio-bar-4 {
          animation: barAnimation1 1.3s ease-in-out infinite alternate;
        }
        
        @keyframes barAnimation1 {
          0% { height: 8px; }
          50% { height: 16px; }
          100% { height: 12px; }
        }
        
        @keyframes barAnimation2 {
          0% { height: 16px; }
          50% { height: 8px; }
          100% { height: 24px; }
        }
        
        @keyframes barAnimation3 {
          0% { height: 10px; }
          50% { height: 20px; }
          100% { height: 14px; }
        }
      `}</style>
    </>
  );
};

export default MediaClips;