'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tab,
  Tabs,
  IconButton,
  Drawer,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  alpha,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountCircle, Logout, Settings, Dashboard, Notifications } from '@mui/icons-material';
import axios from 'axios';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '../components/signin';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const NavContent = ({ isLoggedIn = 0 }) => {
  const pathname = usePathname();
  const [value, setValue] = useState(0); // active tab index for desktop
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const theme = useTheme();

  // Use Material UI's useMediaQuery to detect mobile devices (width ≤600px)
  const isMobile = useMediaQuery('(max-width:600px)');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    // Get user info from localStorage when component mounts
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserName) setUserName(storedUserName);
    if (storedUserEmail) setUserEmail(storedUserEmail);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleMobileDrawer = (open) => () => {
    setMobileDrawerOpen(open);
  };

  const googleLogin = useGoogleLogin({
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
        
        // Check if there's already a custom name saved
        const existingCustomName = localStorage.getItem('userName');
        if (!existingCustomName) {
          localStorage.setItem('userName', data.user.name);
          setUserName(data.user.name);
        } else {
          setUserName(existingCustomName);
        }
        
        localStorage.setItem('userEmail', data.user.email);
        setUserEmail(data.user.email);
        console.log('User data set: ', data.user);
        setAnchorEl(null);
        window.location.reload();
        window.location.href = '/library';
      } catch (err) {
        console.error('Login failed:', err);
      }
    },
    flow: 'auth-code',
  });

  // Add useEffect to check session and get user info when component mounts
  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        try {
          const response = await fetch('https://pondemand-b26dced7fb8b.herokuapp.com/check_session', {
            headers: {
              'Authorization': sessionToken
            }
          });
          const data = await response.json();
          console.log('Session check response:', data);
          if (response.ok) {
            // Check for existing custom name in localStorage
            const existingCustomName = localStorage.getItem('userName');
            
            if (data.name && !existingCustomName) {
              setUserName(data.name);
              localStorage.setItem('userName', data.name);
            } else if (existingCustomName) {
              setUserName(existingCustomName);
            }
            
            if (data.email) {
              setUserEmail(data.email);
              localStorage.setItem('userEmail', data.email);
            }
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'https://pondemand-b26dced7fb8b.herokuapp.com/logout',
        {},
        {
          headers: {
            'Authorization': localStorage.getItem('sessionToken'),
          },
        }
      );

      if (response.status === 200) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        setUserName('');
        setUserEmail('');
        setAnchorEl(null);
        window.location.reload();
        window.location.href = '/main';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  // List of navigation items.
  const navItems = [
    { label: 'Discover', href: '/main' },
    { label: 'Create', href: '/byyou' },
    { label: 'Library', href: '/library' },
    { label: 'About', href: '/feedback' },
  ];

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          background: '#1a1a1a',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 1200,
          top: 0,
          left: 0,
          right: 0,
          transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: { xs: '16px', sm: '24px', md: '32px' },
            paddingRight: { xs: '16px', sm: '24px', md: '32px' },
            height: { xs: '64px', sm: '72px' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {/* Logo linking to the landing page */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#4a90e2',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    letterSpacing: '0.5px',
                    marginRight: '8px',
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    position: 'relative',
                    textShadow: '0 0 10px rgba(74, 144, 226, 0.3)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-4px',
                      left: '0',
                      width: '100%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #4a90e2, #64b5f6)',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                      transformOrigin: 'left',
                    },
                  }}
                >
                  pondemand
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation Tabs */}
            {!isMobile && (
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="navigation tabs"
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  '& .MuiTabs-indicator': { display: 'none' },
                  minHeight: '48px',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  marginLeft: '32px',
                }}
              >
                {navItems.map((item, index) => (
                  <Tab
                    key={index}
                    label={
                      <Link
                        href={item.href}
                        style={{ 
                          textDecoration: 'none',
                          color: pathname === item.href ? '#4a90e2' : 'rgba(255, 255, 255, 0.9)',
                          fontWeight: pathname === item.href ? 'bold' : 'normal',
                          fontSize: '0.9rem',
                          letterSpacing: '0.5px',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          textShadow: pathname === item.href ? '0 0 10px rgba(74, 144, 226, 0.3)' : 'none',
                          '&:hover': {
                            color: '#4a90e2',
                            backgroundColor: 'rgba(74, 144, 226, 0.08)',
                          },
                        }}
                      >
                        {item.label}
                      </Link>
                    }
                    sx={{ 
                      textTransform: 'none', 
                      minWidth: 100, 
                      padding: '0px 10px',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        width: pathname === item.href ? '20px' : '0',
                        height: '2px',
                        background: 'linear-gradient(90deg, #4a90e2, #64b5f6)',
                        transform: 'translateX(-50%)',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::after': {
                        width: '20px',
                      },
                    }}
                  />
                ))}
              </Tabs>
            )}
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Button
                component={Link}
                href="/feedback#contact"
                variant="outlined"
                sx={{
                  color: '#4a90e2',
                  borderColor: 'rgba(74, 144, 226, 0.5)',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  padding: '6px 16px',
                  marginRight: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.08)',
                  },
                }}
              >
                Contact Sales
              </Button>
            )}

            {/* For Mobile: Render Account and Hamburger icons side by side with a vertical Divider */}
            {isMobile ? (
              <>
                <IconButton
                  onClick={handleClick}
                  sx={{ 
                    color: 'white', 
                    '&:hover': { 
                      color: '#4a90e2',
                      backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <AccountCircle />
                </IconButton>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ 
                    mx: 1, 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderWidth: 1,
                    height: '24px',
                  }}
                />
                <IconButton
                  onClick={toggleMobileDrawer(true)}
                  sx={{
                    color: mobileDrawerOpen ? '#4a90e2' : 'white',
                    '&:hover': { 
                      color: '#4a90e2',
                      backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={handleClick}
                  sx={{ 
                    color: 'white', 
                    '&:hover': { 
                      color: '#4a90e2',
                      backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <AccountCircle />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: '#1a1a1a',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                backgroundColor: '#1a1a1a',
                border: `1px solid ${alpha('#ffffff', 0.1)}`,
                borderRadius: '12px',
                minWidth: 180,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {isLoggedIn ? (
              <Box>
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#4a90e2' }}>{userName ? userName[0].toUpperCase() : 'U'}</Avatar>
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {userName || 'User Name'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {userEmail || 'user@example.com'}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <Link href="/library" style={{ textDecoration: 'none' }}>
                  <MenuItem onClick={handleClose} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <Dashboard fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" sx={{ color: 'white' }} />
                  </MenuItem>
                </Link>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                  <MenuItem onClick={handleClose} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <Settings fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Settings" sx={{ color: 'white' }} />
                  </MenuItem>
                </Link>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" sx={{ color: 'white' }} />
                </MenuItem>
              </Box>
            ) : (
              <MenuItem onClick={handleGoogleLogin} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </ListItemIcon>
                <ListItemText primary="Sign In" sx={{ color: 'white' }} />
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Spacer to prevent content from being hidden under the fixed navbar */}
      <Box 
        component="div" 
        sx={{ 
          height: { xs: '64px', sm: '72px' }, // Match the height of the AppBar
          width: '100%',
          backgroundColor: '#1a1a1a',
        }} 
      />

      {/* Mobile Full-Screen Drawer for Navigation */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer(false)}
          PaperProps={{
            sx: {
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              padding: '2rem',
              position: 'relative',
            },
          }}
        >
          {/* Close (X) Button for Mobile Drawer */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton
              onClick={toggleMobileDrawer(false)}
              sx={{ 
                color: 'white', 
                '&:hover': { 
                  color: '#4a90e2',
                  backgroundColor: 'rgba(74, 144, 226, 0.08)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>×</Typography>
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', mt: 4 }}>
            {navItems.map((item, index) => (
              <Link key={index} href={item.href} style={{ textDecoration: 'none', width: '100%' }} onClick={toggleMobileDrawer(false)}>
                <Typography
                  sx={{
                    color: pathname === item.href ? '#4a90e2' : '#fff',
                    fontWeight: pathname === item.href ? 'bold' : 'normal',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    padding: '1rem 0',
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      width: pathname === item.href ? '40px' : '0',
                      height: '2px',
                      background: 'linear-gradient(90deg, #4a90e2, #64b5f6)',
                      transform: 'translateX(-50%)',
                      transition: 'width 0.3s ease',
                    },
                  }}
                >
                  {item.label}
                </Typography>
              </Link>
            ))}
            {/* Mobile: Connect With Us Button */}
            <Button
              component={Link}
              href="/feedback#contact"
              sx={{
                border: '2px solid #4a90e2',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '8px',
                padding: '8px 16px',
                textTransform: 'none',
                marginTop: '2rem',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-5px)' },
                },
                fontFamily: "'Outfit', 'Inter', sans-serif",
                '&:hover': {
                  backgroundColor: 'rgba(74, 144, 226, 0.08)',
                  border: '2px solid #4a90e2',
                },
              }}
            >
              Connect With Us
            </Button>
          </Box>
        </Drawer>
      )}
    </div>
  );
};

// Wrap NavContent with GoogleOAuthProvider so that OAuth components have the proper context.
export default function Nav(props) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <NavContent {...props} />
    </GoogleOAuthProvider>
  );
}