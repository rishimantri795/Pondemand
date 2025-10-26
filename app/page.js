'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Fade,
  Button,
  Grid,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import TuneIcon from '@mui/icons-material/Tune';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import HeadsetIcon from '@mui/icons-material/Headset';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupIcon from '@mui/icons-material/Group';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CodeIcon from '@mui/icons-material/Code';
import CampaignIcon from '@mui/icons-material/Campaign';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { BoltIcon } from 'lucide-react';

export default function Home() {
  const [fadeIn, setFadeIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const videoRefs = useRef({});
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setFadeIn(true);
    
    // Check local storage for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      setDarkMode(prefersDarkMode);
    }
    
    // Initialize all videos to paused
    return () => {
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl) {
          videoEl.pause();
        }
      });
    };
  }, [prefersDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const handleTabChange = (_e, value) => {
    setCurrentTab(value);
    // Pause any playing video when tab changes
    if (playingVideo) {
      const videoEl = videoRefs.current[playingVideo];
      if (videoEl) {
        videoEl.pause();
      }
      setPlayingVideo(null);
    }
  };

  const handleVideoMouseEnter = (index) => {
    // Pause the previously playing video if there is one
    if (playingVideo !== null && playingVideo !== index) {
      const prevVideoEl = videoRefs.current[playingVideo];
      if (prevVideoEl) {
        prevVideoEl.pause();
      }
    }
    
    // Play the current video
    const videoEl = videoRefs.current[index];
    if (videoEl) {
      videoEl.play().catch(e => console.error("Video play failed:", e));
      setPlayingVideo(index);
    }
  };

  const handleVideoMouseLeave = (index) => {
    const videoEl = videoRefs.current[index];
    if (videoEl) {
      videoEl.pause();
      setPlayingVideo(null);
    }
  };

  // Overview features
  const features = [
    {
      title: 'Upload your sources',
      Icon: DescriptionIcon,
      text: [
        'Upload PDFs, URLs, docs, sheets, or text. Our AI understands and powers tailored podcasts.',
        '',
      ],
      path: '/fileuploaddemo.mp4',
    },
    {
      title: 'Customize Your Controls',
      Icon: TuneIcon,
      text: [
        'Adjust length, style, and speaker voices. Use voice cloning for a personal touch.',
        '',
      ],
      path: '/customcontrols.mp4',
    },
    {
      title: 'Generate Your Podcast',
      Icon: PodcastsIcon,
      text: [
        'Create episodes with interactive transcripts. Listen, review, and refine until perfect.',
        '',
      ],
      path: '/generatepodcast.mp4',
    },
    {
      title: 'Share & Listen',
      Icon: HeadsetIcon,
      text: [
        'Save episodes for on‑demand listening. Share via email, social, or embed easily.',
        '',
      ],
      path: '/sharelisten.mp4',
    },
  ];

  // Overview usage examples
  const threeItems = [
    {
      title: 'Dig Deeper',
      Icon: InsightsIcon,
      text: ['Explore niche topics.', 'Gain deep insights fast.'],
    },
    {
      title: 'Internal Updates',
      Icon: GroupIcon,
      text: [
        'Turn trainings & reports into audio.',
        'Deliver important content to employees on-the-go.',
      ],
    },
    {
      title: 'Client Engagement',
      Icon: HandshakeIcon,
      text: ['Deliver tailored audio content.', 'Boost engagement rates.'],
    },
  ];

  // Features for Pondemand and Pondemand Pro
  const pondemandFeatures = [
    'Conversations curated with the latest, most genuine audio models',
    'Daily Credits (3x)',
    'Upload PDFs, websites, Google Docs and Slides, YouTube URLs, and more',
    'Adjust the length of the conversation',
    'Generate, download, and share podcasts that you can listen to on-the-go'
  ];
  
  
  const pondemandProFeatures = [
    'Get unlimited podcast generations, queries, and source uploads',
    'Get larger file/source uploads, as well as options to upload different files types',
    'Increase personalization with advanced customization controls (voice type, voice cloning, conversation style, etc)',
    'Ensure the accuracy of generated podcasts with interactive transcripts and editing capabilities'
  ];
  
  
  // Use case sections
  const useCases = [
    {
      title: 'Sales',
      Icon: HandshakeIcon,
      description: 'Add your product information, competitor analysis, and market research.',
      benefit: 'Pondemand can create a shared knowledge base to help your team make better decisions and answer customer questions more accurately.'
    },
    {
      title: 'Training & Onboarding',
      Icon: MenuBookIcon,
      description: 'Add your existing training manuals, presentations, and videos.',
      benefit: 'Pondemand can help your newest hires get up to speed quickly and effectively.'
    },
    {
      title: 'Marketing',
      Icon: CampaignIcon,
      description: 'Add your blog posts, reports, and webinars.',
      benefit: 'Pondemand can help your team transform existing material and create engaging content consistently and easily.'
    },
    {
      title: 'Teaching & Learning',
      Icon: SchoolIcon,
      description: 'Add your district\'s strategy plan, education standards, lecture notes, and course readings.',
      benefit: 'Pondemand can help you generate summaries, guided lesson plans, study guides, discussion questions, and quizzes.'
    },
    {
      title: 'Customer Support',
      Icon: SupportAgentIcon,
      description: 'Add your help center articles, FAQs, and product documents.',
      benefit: 'Pondemand can help you quickly source the answers to customer questions.'
    },
    {
      title: 'Development',
      Icon: CodeIcon,
      description: 'Add your product specifications, design documents, and user feedback reports.',
      benefit: 'Pondemand can help your product team centralize information, make informed decisions, and accelerate product development.'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflowY: 'auto',
        backgroundColor: darkMode ? 'rgb(18, 18, 18)' : 'white',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: 'relative',
        color: darkMode ? 'white' : 'black',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Nav Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 0,
          right: 0,
          px: { xs: 0, md: 0 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            textTransform: 'lowercase',
            background: 'linear-gradient(45deg, #4a90e2, #00c5d1)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'gradientMove 5s ease infinite',
            ml: { xs: 1, md: 4 },
          }}
        >
          pondemand
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{ minHeight: 0 }}
          >
            <Tab
              value="overview"
              label="Overview"
              sx={{
                minHeight: 0,
                fontWeight: 300,
                color: currentTab === 'overview' 
                  ? (darkMode ? 'white' : 'black') 
                  : (darkMode ? '#aaa' : '#888'),
                borderBottom: currentTab === 'overview' 
                  ? `2px solid ${darkMode ? 'white' : 'black'}` 
                  : 'none',
                borderRadius: 0,
              }}
            />
            <Tab
              value="pro"
              label="Pondemand Pro"
              sx={{
                minHeight: 0,
                fontWeight: 300,
                color: currentTab === 'pro' 
                  ? (darkMode ? 'white' : 'black') 
                  : (darkMode ? '#aaa' : '#888'),
                borderBottom: currentTab === 'pro' 
                  ? `2px solid ${darkMode ? 'white' : 'black'}` 
                  : 'none',
                borderRadius: 0,
              }}
            />
          </Tabs>
          
          <IconButton 
            onClick={toggleDarkMode} 
            color="inherit"
            sx={{ 
              ml: 2, 
              mr: { xs: 3, md: 6 },
              color: darkMode ? 'white' : 'black',
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Box>

      {/* OVERVIEW */}
      {currentTab === 'overview' && (
        <>
          {/* Hero */}
          <Fade in={fadeIn} timeout={1000}>
            <Box
              sx={{
                textAlign: 'center',
                px: { xs: 2, md: 8 },
                mt: { xs: '18vh', md: '22vh' },
                pb: { xs: '15vh', md: '12vh' },
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: 'clamp(3.75rem, 10vw, 6rem)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  background: darkMode ? 'linear-gradient(to bottom, #ffffff 0%, #bbbbbb 100%)' : 'linear-gradient(to bottom, #1a1a1a 0%, #404040 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.03em',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Tailored Podcasts,
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: 'clamp(3.75rem, 10vw, 6rem)',
                  fontWeight: 600,
                  mt: 1,
                  background:
                    'linear-gradient(45deg, #4a90e2, #00c5d1, #4a90e2)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  animation: 'gradientMove 5s ease infinite',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  lineHeight: 1.1,
                }}
              >
                Upon Demand
              </Typography>
              <Typography
                component="p"
                sx={{
                  mt: 5,
                  fontSize: 'clamp(1.25rem, 1.25vw, 1.5rem)',
                  color: darkMode ? '#bbb' : '#444',
                  maxWidth: 600,
                  mx: 'auto',
                  fontWeight: 300,
                  lineHeight: 1.4,
                  whiteSpace: 'pre-line',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                {'The ultimate AI-powered tool for curating tailored podcasts to engage your audience.'}
              </Typography>
              <Box sx={{ mt: 7 }}>
                <Button
                  component={Link}
                  href="/main"
                  variant="contained"
                  sx={{
                    px: 6,
                    py: 2,
                    background: 'linear-gradient(45deg, #4a90e2 30%, #00c5d1 90%)',
                    color: '#fff',
                    fontSize: '1.25rem',
                    textTransform: 'none',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    '&:hover': { background: 'linear-gradient(45deg, #357ABD 30%, #00a5b1 90%)' },
                  }}
                >
                  Try Now 
                </Button>
              </Box>
              <Typography
                component="h2"
                sx={{
                  mt: 12,
                  fontSize: 'clamp(2.25rem, 3vw, 3rem)',
                  fontWeight: 300,
                  color: darkMode ? 'white' : 'black',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Existing Content, Greater Engagement
              </Typography>
            </Box>
          </Fade>

          {/* Main Features */}
          <Box component="section" sx={{ py: 12, px: { xs: 2, md: 8 } }}>
            {features.map((feat, idx) => (
              <Grid
                container
                spacing={8}
                alignItems="flex-start"
                key={idx}
                sx={{ mb: idx < features.length - 1 ? 12 : 0 }}
              >
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      pl: { xs: 2, md: 20 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <feat.Icon
                      sx={{ fontSize: 56, color: '#4a90e2', mb: 1 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 300,
                        fontSize: '1.875rem',
                        color: darkMode ? 'white' : 'black',
                        mb: 2,
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      {feat.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: darkMode ? '#bbb' : '#666',
                        fontWeight: 300,
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        maxWidth: 400,
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      {feat.text.map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                  onMouseEnter={() => handleVideoMouseEnter(idx)}
                  onMouseLeave={() => handleVideoMouseLeave(idx)}
                >
                  <video 
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    loop 
                    muted
                    playsInline
                    style={{ 
                      borderRadius: '16px', 
                      boxShadow: darkMode 
                        ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                        : '0 10px 25px rgba(0, 0, 0, 0.1)' 
                    }}
                  >
                    <source src={feat.path} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Grid>
              </Grid>
            ))}
          </Box>

          {/* Use Cases Section (New section similar to NotebookLM) */}
          {/* <Box sx={{ py: 8, px: { xs: 2, md: 8 } }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 500,
                fontSize: 'clamp(2.5rem, 3vw, 3rem)',
                textAlign: 'center',
                color: 'black',
                mb: 10,
              }}
            >
              How Pondemand can work for you and
              <br />
              your organization
            </Typography>

            <Grid container spacing={4}>
              {useCases.map((useCase, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: '10px',
                      bgcolor: '#f9f9fb',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <useCase.Icon
                      sx={{
                        fontSize: 48,
                        color: '#4a90e2',
                        mb: 2
                      }}
                    />
                    
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.5rem',
                        mb: 2,
                        color: 'black',
                      }}
                    >
                      {useCase.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#666',
                        fontWeight: 400,
                        fontSize: '1rem',
                        mb: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {useCase.description}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#666',
                        fontWeight: 400,
                        fontSize: '1rem',
                        lineHeight: 1.5,
                        mt: 'auto',
                      }}
                    >
                      {useCase.benefit}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box> */}

          {/* Privacy */}
          <Box
            component="section"
            sx={{
              backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.7)' : '#fafafa',
              py: 12,
              px: 0,
              transition: 'background-color 0.3s ease',
              width: '100vw',
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
            }}
          >
            <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 8 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  fontSize: '2.5rem',
                  textAlign: 'center',
                  mb: 2,
                  color: darkMode ? 'white' : 'black',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                We value your privacy — your data belongs ONLY to you
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: darkMode ? '#bbb' : '#888',
                  fontSize: '1.125rem',
                  maxWidth: 800,
                  mx: 'auto',
                  lineHeight: 1.6,
                  textAlign: 'center',
                  fontWeight: 400,
                  mt: 4,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                Pondemand never uses your personal data, source uploads,
                queries, or transcripts to train our models. Everything you
                share stays private and secure.
              </Typography>
            </Box>
          </Box>

          {/* Usage Title */}
          <Box sx={{ py: 8, px: { xs: 2, md: 8 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 300,
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                textAlign: 'center',
                color: darkMode ? 'white' : 'black',
                mb: 4,
                fontFamily: "'Outfit', 'Inter', sans-serif",
              }}
            >
              How our clients are using Pondemand
            </Typography>
          </Box>

          {/* Usage Examples */}
          <Box
            component="section"
            sx={{
              py: 2,
              px: { xs: 2, md: 8 },
              transform: { md: 'translateX(5%) translateY(-16px)' },
            }}
          >
            <Grid container spacing={6} justifyContent="space-evenly">
              {threeItems.map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <item.Icon sx={{ fontSize: 56, color: '#4a90e2', mb: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 300,
                        fontSize: '1.875rem',
                        color: darkMode ? 'white' : 'black',
                        mb: 1,
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: darkMode ? '#bbb' : '#666',
                        fontWeight: 300,
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        maxWidth: 300,
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      {item.text.map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {/* PRO */}
      {currentTab === 'pro' && (
        <Fade in={fadeIn} timeout={1000}>
          <Box
            sx={{
              textAlign: 'center',
              px: { xs: 2, md: 8 },
              mt: { xs: '18vh', md: '22vh' },
              pb: { xs: '15vh', md: '12vh' },
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: 'clamp(3.75rem, 10vw, 6rem)',
                fontWeight: 600,
                lineHeight: 1.1,
                background: darkMode ? 'linear-gradient(to bottom, #ffffff 0%, #bbbbbb 100%)' : 'linear-gradient(to bottom, #1a1a1a 0%, #404040 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.03em',
                fontFamily: "'Outfit', 'Inter', sans-serif",
                position: 'relative',
                zIndex: 1,
                display: 'inline-block',
                marginRight: '1.5rem'
              }}
            >
              Pondemand
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontSize: 'clamp(3.75rem, 10vw, 6rem)',
                fontWeight: 600,
                mt: 1,
                background: 'linear-gradient(45deg, #4a90e2, #00c5d1, #4a90e2)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                animation: 'gradientMove 5s ease infinite',
                fontFamily: "'Outfit', 'Inter', sans-serif",
                lineHeight: 1.1,
                display: 'inline-block'
              }}
            >
              {' '}Pro
            </Typography>
            <Typography
              component="p"
              sx={{
                mt: 2,
                fontSize: 'clamp(1.25rem, 1.25vw, 1.5rem)',
                color: darkMode ? '#bbb' : '#666',
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 300,
                lineHeight: 1.4,
                fontFamily: "'Outfit', 'Inter', sans-serif",
              }}
            >
              For power users, teams, and organizations who want the most capable auditory engagement platform.
            </Typography>

            <Box sx={{ mt: 7 }}>
              <Button
                component={Link}
                href="/main"
                variant="contained"
                sx={{
                  px: 6,
                  py: 2,
                  background: 'linear-gradient(45deg, #4a90e2 30%, #00c5d1 90%)',
                  color: '#fff',
                  fontSize: '1.25rem',
                  textTransform: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  '&:hover': { background: 'linear-gradient(45deg, #357ABD 30%, #00a5b1 90%)' },
                }}
              >
                Try Now 
              </Button>
            </Box>

            <Typography
              component="h2"
              sx={{
                mt: 10,
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                fontWeight: 300,
                color: darkMode ? 'white' : 'black',
                fontFamily: "'Outfit', 'Inter', sans-serif",
              }}
            >
              Unlock premium features
            </Typography>

            <Grid container spacing={4} justifyContent="center" sx={{ mt: 6 }}>
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    p: 4,
                    height: '100%',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.7)' : 'white',
                    transition: 'background-color 0.3s ease, border 0.3s ease',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      fontSize: '2rem',
                      mb: 4,
                      color: darkMode ? 'white' : 'black',
                      textAlign: 'center',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Pondemand
                  </Typography>

                  <Box
                    sx={{
                      backgroundColor: darkMode ? 'rgba(74,144,226,0.15)' : 'rgba(74,144,226,0.1)',
                      borderTop: '1px solid rgba(74,144,226,0.2)',
                      borderBottom: '1px solid rgba(74,144,226,0.2)',
                      py: 3,
                      px: 3,
                      mx: -4,
                      mb: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '64px', // Fixed height to match Pro box
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 400,
                        color: '#4a90e2',
                        fontSize: '1rem',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      Free for individuals to get started
                    </Typography>
                  </Box>

                  <List disablePadding>
                    {pondemandFeatures.map((feat, i) => (
                      <ListItem 
                        key={i} 
                        disableGutters
                        sx={{ 
                          mb: i < pondemandFeatures.length - 1 ? 2.5 : 0,
                          '&:before': {
                            content: '""',
                            display: 'inline-block',
                            height: '8px',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: '2px' }}>
                          <CheckCircleIcon sx={{ fontSize: 30, color: '#4a90e2' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feat}
                          primaryTypographyProps={{
                            fontWeight: 300,
                            color: darkMode ? '#bbb' : '#666',
                            textAlign: 'left',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    p: 4,
                    height: '100%',
                    border: '2px solid transparent',
                    backgroundImage: `linear-gradient(${darkMode ? 'rgb(30, 30, 30)' : 'white'}, ${darkMode ? 'rgb(30, 30, 30)' : 'white'}), linear-gradient(90deg, #4a90e2, #00c5d1)`,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    boxShadow: darkMode 
                      ? '0 0 60px rgba(0,197,209,0.2), 0 0 35px rgba(74,144,226,0.3)' 
                      : '0 0 60px rgba(0,197,209,0.4), 0 0 35px rgba(74,144,226,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.7)' : 'white',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      fontSize: '2rem',
                      mb: 1,
                      textAlign: 'center',
                      color: darkMode ? 'white' : 'black',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Pondemand{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#4a90e2',
                      }}
                    >
                      Pro
                    </Box>
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      fontSize: '1.25rem',
                      mb: 4,
                      color: darkMode ? '#bbb' : '#666',
                      textAlign: 'center',
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    $59.99 / month
                  </Typography>

                  <Box
                    sx={{
                      background: 'linear-gradient(90deg, rgba(0,197,209,0.15), rgba(74,144,226,0.15))',
                      borderTop: '1px solid rgba(74,144,226,0.2)',
                      borderBottom: '1px solid rgba(74,144,226,0.2)',
                      py: 3,
                      px: 3,
                      mx: -4,
                      mb: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '64px', // Fixed height to match free box
                    }}
                  >
                    
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: '#4a90e2',
                        fontSize: '1rem',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                      }}
                    >
                      Everything in Pondemand, plus the following:
                    </Typography>
                  </Box>

                  <List disablePadding sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {pondemandProFeatures.map((feat, i) => (
                      <ListItem key={i} disableGutters sx={{ mb: i < pondemandProFeatures.length - 1 ? 2 : 0 }}>
                        <ListItemIcon sx={{ minWidth: 40, mt: '2px' }}>
                          <CheckCircleIcon sx={{ fontSize: 30, color: '#4a90e2' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feat}
                          primaryTypographyProps={{
                            fontWeight: 300,
                            color: darkMode ? '#bbb' : '#666',
                            textAlign: 'left',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 'auto', pt: 4 }}>
                    <Button
                      component={Link}
                      href="/pro-signup"
                      variant="contained"
                      sx={{
                        px: 6,
                        py: 1.5,
                        width: '100%',
                        bgcolor: '#4a90e2',
                        color: '#fff',
                        fontSize: '1.125rem',
                        textTransform: 'none',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#357ABD' },
                      }}
                    >
                      Upgrade to Pro
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Privacy Section */}
            <Box
              component="section"
              sx={{
                backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.7)' : '#fafafa',
                py: 12,
                px: 0,
                mt: 8,
                transition: 'background-color 0.3s ease',
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
              }}
            >
              <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 8 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 300,
                    fontSize: '2.5rem',
                    textAlign: 'center',
                    mb: 2,
                    color: darkMode ? 'white' : 'black',
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  We value your privacy — your data belongs ONLY to you
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: darkMode ? '#bbb' : '#888',
                    fontSize: '1.125rem',
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.6,
                    textAlign: 'center',
                    fontWeight: 400,
                    mt: 4,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  }}
                >
                  Pondemand never uses your personal data, source uploads,
                  queries, or transcripts to train our models. Everything you
                  share stays private and secure.
                </Typography>
              </Box>
            </Box>
            
            {/* Use Cases Section on Pro Tab too */}
            <Box sx={{ mt: 16, px: { xs: 0, md: 4 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 300,
                  fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                  textAlign: 'center',
                  color: darkMode ? 'white' : 'black',
                  mb: 10,
                  whiteSpace: 'pre-line',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}
              >
                {`How Pondemand can work for you and\nyour organization`}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Grid
                  container
                  rowSpacing={6}
                  columnSpacing={-2}
                  justifyContent="center"
                  sx={{ maxWidth: '1000px' }}
                >
                  {useCases.map((useCase, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Box
                        sx={{
                          p: 4,
                          borderRadius: '10px',
                          bgcolor: darkMode ? 'rgba(42, 42, 42, 0.7)' : '#f9f9fb',
                          display: 'flex',
                          flexDirection: 'column',
                          height: 380,
                          width: { xs: '100%', md: 300 },
                          mx: 'auto',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <useCase.Icon
                          sx={{
                            fontSize: 48,
                            color: '#4a90e2',
                            mb: 2,
                            alignSelf: 'flex-start',
                          }}
                        />

                        <Typography
                          variant="h5"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: '1.25rem',
                            mb: 2,
                            color: darkMode ? 'white' : 'black',
                            textAlign: 'left',
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                          }}
                        >
                          {useCase.title}
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            color: darkMode ? '#bbb' : '#666',
                            fontWeight: 300,
                            fontSize: '1rem',
                            lineHeight: 1.5,
                            textAlign: 'left',
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                          }}
                        >
                          {`${useCase.description} ${useCase.benefit}`}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 10,
          px: 0,
          textAlign: 'center',
          backgroundColor: darkMode ? 'rgba(25, 25, 25, 0.8)' : '#fafafa',
          mt: 8,
          transition: 'background-color 0.3s ease',
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
        }}
      >
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 8 } }}>
          <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : '#666', fontWeight: 300 }}>
            © {new Date().getFullYear()} Pondemand. All rights reserved.
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 200% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          50%     { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
}